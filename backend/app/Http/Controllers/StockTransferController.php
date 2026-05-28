<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ErrorLog;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class StockTransferController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = StockTransfer::with(['product', 'fromWarehouse', 'toWarehouse', 'user'])
            ->latest();

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('from_warehouse_id', $request->warehouse_id)
                    ->orWhere('to_warehouse_id', $request->warehouse_id);
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Data transfer stok berhasil diambil',
            'data' => $query->paginate($perPage),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id|different:to_warehouse_id',
            'to_warehouse_id' => 'required|exists:warehouses,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        try {
            $transfer = DB::transaction(function () use ($request, $validated) {
                $product = Product::findOrFail($validated['product_id']);
                Warehouse::findOrFail($validated['from_warehouse_id']);
                Warehouse::findOrFail($validated['to_warehouse_id']);

                $fromStock = $this->getOrCreateWarehouseStock($product, (int) $validated['from_warehouse_id']);
                $toStock = $this->getOrCreateWarehouseStock($product, (int) $validated['to_warehouse_id']);

                if ($fromStock->quantity < (int) $validated['quantity']) {
                    ErrorLog::create([
                        'severity' => 'warning',
                        'source' => 'stock_transfers.create',
                        'message' => 'Stok gudang asal tidak mencukupi untuk transfer.',
                        'context' => [
                            'product_id' => $product->id,
                            'from_warehouse_id' => $validated['from_warehouse_id'],
                            'available_quantity' => $fromStock->quantity,
                            'requested_quantity' => $validated['quantity'],
                        ],
                        'user_id' => $request->user()?->id,
                        'ip_address' => $request->ip(),
                    ]);
                    abort(422, 'Stok gudang asal tidak mencukupi.');
                }

                $fromStock->quantity -= (int) $validated['quantity'];
                $fromStock->save();

                $toStock->quantity += (int) $validated['quantity'];
                $toStock->save();

                $product->current_stock = (int) WarehouseStock::where('product_id', $product->id)->sum('quantity');
                $product->save();

                $transfer = StockTransfer::create([
                    ...$validated,
                    'status' => 'completed',
                    'user_id' => $request->user()->id,
                ]);

                AuditLog::create([
                    'user_id' => $request->user()->id,
                    'action' => 'transfer',
                    'table_name' => 'stock_transfers',
                    'record_id' => $transfer->id,
                    'description' => 'Transfer stok antar gudang #' . $transfer->id,
                    'ip_address' => $request->ip(),
                    'new_values' => $transfer->toArray(),
                ]);

                return $transfer;
            });
        } catch (\Throwable $exception) {
            StockTransfer::create([
                ...$validated,
                'status' => 'failed',
                'user_id' => $request->user()?->id,
            ]);

            $isExpectedValidationFailure = $exception instanceof HttpExceptionInterface
                && $exception->getStatusCode() === 422;

            if (!$isExpectedValidationFailure) {
                ErrorLog::create([
                    'severity' => 'critical',
                    'source' => 'stock_transfers.create',
                    'message' => 'Transfer stok gagal diproses.',
                    'context' => ['error' => $exception->getMessage()],
                    'user_id' => $request->user()?->id,
                    'ip_address' => $request->ip(),
                ]);
            }

            throw $exception;
        }

        return response()->json([
            'success' => true,
            'message' => 'Transfer stok berhasil dibuat',
            'data' => $transfer->load(['product', 'fromWarehouse', 'toWarehouse', 'user']),
        ], 201);
    }

    public function show(StockTransfer $stockTransfer)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail transfer stok berhasil diambil',
            'data' => $stockTransfer->load(['product', 'fromWarehouse', 'toWarehouse', 'user']),
        ]);
    }

    private function getOrCreateWarehouseStock(Product $product, int $warehouseId): WarehouseStock
    {
        $warehouseStock = WarehouseStock::where('product_id', $product->id)
            ->where('warehouse_id', $warehouseId)
            ->lockForUpdate()
            ->first();

        if ($warehouseStock) {
            return $warehouseStock;
        }

        return WarehouseStock::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouseId,
            'quantity' => 0,
            'minimum_stock' => $product->minimum_stock,
        ]);
    }
}
