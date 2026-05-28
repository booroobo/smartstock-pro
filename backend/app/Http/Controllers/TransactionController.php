<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ErrorLog;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);
        $sortBy = in_array($request->input('sort_by'), ['transaction_date', 'quantity', 'type', 'created_at'], true)
            ? $request->input('sort_by')
            : 'created_at';
        $sortDirection = strtolower($request->input('sort_direction')) === 'asc' ? 'asc' : 'desc';

        $query = StockTransaction::with(['product.category', 'warehouse', 'user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'ilike', "%{$search}%")
                    ->orWhere('id', $search)
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'ilike', "%{$search}%")
                            ->orWhere('sku', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('transaction_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('transaction_date', '<=', $request->end_date);
        }

        $transactions = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data transaksi stok berhasil diambil',
            'data' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'type' => 'required|in:stock_in,stock_out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $transaction = DB::transaction(function () use ($request, $validated) {
            $product = $this->findProduct($validated['product_id']);
            $this->findWarehouse($validated['warehouse_id']);
            $this->applyWarehouseStock($product, (int) $validated['warehouse_id'], $validated['type'], (int) $validated['quantity']);

            $transaction = StockTransaction::create([
                'user_id' => $request->user()->id,
                ...$validated,
            ]);

            $this->audit($request, 'create', $transaction, null, $transaction->toArray());

            return $transaction;
        });

        return response()->json([
            'success' => true,
            'message' => 'Transaksi stok berhasil dibuat',
            'data' => $transaction->load(['product.category', 'warehouse']),
        ], 201);
    }

    public function show(Request $request, StockTransaction $transaction)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail transaksi stok berhasil diambil',
            'data' => $transaction->load(['product.category', 'warehouse']),
        ]);
    }

    public function update(Request $request, StockTransaction $transaction)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'type' => 'required|in:stock_in,stock_out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        DB::transaction(function () use ($request, $transaction, $validated) {
            $oldValues = $transaction->toArray();
            $sameStockBucket = (int) $transaction->product_id === (int) $validated['product_id']
                && (int) $transaction->warehouse_id === (int) $validated['warehouse_id'];

            if ($sameStockBucket) {
                $product = $this->findProduct($transaction->product_id);
                $oldEffect = $transaction->type === 'stock_in'
                    ? (int) $transaction->quantity
                    : -1 * (int) $transaction->quantity;
                $newEffect = $validated['type'] === 'stock_in'
                    ? (int) $validated['quantity']
                    : -1 * (int) $validated['quantity'];
                $this->adjustWarehouseStockByDelta($product, (int) $transaction->warehouse_id, $newEffect - $oldEffect);
            } else {
                $oldProduct = $this->findProduct($transaction->product_id);
                $this->reverseWarehouseStock($oldProduct, (int) $transaction->warehouse_id, $transaction->type, (int) $transaction->quantity);

                $newProduct = $this->findProduct($validated['product_id']);
                $this->findWarehouse($validated['warehouse_id']);
                $this->applyWarehouseStock($newProduct, (int) $validated['warehouse_id'], $validated['type'], (int) $validated['quantity']);
            }

            $transaction->update($validated);
            $this->audit($request, 'update', $transaction, $oldValues, $transaction->fresh()->toArray());
        });

        return response()->json([
            'success' => true,
            'message' => 'Transaksi stok berhasil diperbarui',
            'data' => $transaction->fresh()->load(['product.category', 'warehouse']),
        ]);
    }

    public function destroy(Request $request, StockTransaction $transaction)
    {
        DB::transaction(function () use ($request, $transaction) {
            $oldValues = $transaction->toArray();
            $product = $this->findProduct($transaction->product_id);
            $this->reverseWarehouseStock($product, (int) $transaction->warehouse_id, $transaction->type, (int) $transaction->quantity);
            $transaction->delete();
            $this->audit($request, 'delete', $transaction, $oldValues, null);
        });

        return response()->json([
            'success' => true,
            'message' => 'Transaksi stok berhasil dihapus',
        ]);
    }

    private function findProduct(int $id): Product
    {
        return Product::findOrFail($id);
    }

    private function findWarehouse(int $id): Warehouse
    {
        return Warehouse::findOrFail($id);
    }

    private function applyWarehouseStock(Product $product, int $warehouseId, string $type, int $quantity): void
    {
        $warehouseStock = $this->getOrCreateWarehouseStock($product, $warehouseId);

        if ($type === 'stock_out' && $warehouseStock->quantity < $quantity) {
            ErrorLog::create([
                'severity' => 'warning',
                'source' => 'stock_transactions.stock_out',
                'message' => 'Stok gudang tidak mencukupi untuk transaksi stok keluar.',
                'context' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'warehouse_id' => $warehouseId,
                    'warehouse_stock' => $warehouseStock->quantity,
                    'requested_quantity' => $quantity,
                ],
                'user_id' => request()->user()?->id,
                'ip_address' => request()->ip(),
            ]);
            abort(422, 'Stok gudang tidak mencukupi.');
        }

        $warehouseStock->quantity = $type === 'stock_in'
            ? $warehouseStock->quantity + $quantity
            : $warehouseStock->quantity - $quantity;
        $warehouseStock->save();

        $this->syncProductCurrentStock($product);
    }

    private function reverseWarehouseStock(Product $product, int $warehouseId, string $type, int $quantity): void
    {
        $warehouseStock = $this->getOrCreateWarehouseStock($product, $warehouseId);

        if ($type === 'stock_in' && $warehouseStock->quantity < $quantity) {
            abort(422, 'Transaksi tidak dapat dibatalkan karena stok gudang sudah berpindah atau tidak mencukupi.');
        }

        $warehouseStock->quantity = $type === 'stock_in'
            ? $warehouseStock->quantity - $quantity
            : $warehouseStock->quantity + $quantity;
        $warehouseStock->save();

        $this->syncProductCurrentStock($product);
    }

    private function adjustWarehouseStockByDelta(Product $product, int $warehouseId, int $delta): void
    {
        if ($delta === 0) {
            return;
        }

        $warehouseStock = $this->getOrCreateWarehouseStock($product, $warehouseId);

        if ($delta < 0 && $warehouseStock->quantity < abs($delta)) {
            abort(422, 'Transaksi tidak dapat diperbarui karena stok gudang tidak mencukupi.');
        }

        $warehouseStock->quantity += $delta;
        $warehouseStock->save();

        $this->syncProductCurrentStock($product);
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

    private function syncProductCurrentStock(Product $product): void
    {
        $product->current_stock = (int) WarehouseStock::where('product_id', $product->id)->sum('quantity');
        $product->save();
    }

    private function audit(Request $request, string $action, StockTransaction $transaction, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'table_name' => 'stock_transactions',
            'record_id' => $transaction->id,
            'description' => ucfirst($action) . ' transaksi stok #' . $transaction->id,
            'ip_address' => $request->ip(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
