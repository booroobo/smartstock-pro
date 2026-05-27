<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = StockTransaction::with(['product.category', 'warehouse', 'user']);

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

        $transactions = $query->latest()->get();

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
            $this->applyStock($product, $validated['type'], (int) $validated['quantity']);

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
            $oldProduct = $this->findProduct($transaction->product_id);
            $this->reverseStock($oldProduct, $transaction->type, (int) $transaction->quantity);

            $newProduct = $this->findProduct($validated['product_id']);
            $this->findWarehouse($validated['warehouse_id']);
            $this->applyStock($newProduct, $validated['type'], (int) $validated['quantity']);

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
            $this->reverseStock($product, $transaction->type, (int) $transaction->quantity);
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

    private function applyStock(Product $product, string $type, int $quantity): void
    {
        if ($type === 'stock_out' && $product->current_stock < $quantity) {
            abort(422, 'Stok produk tidak mencukupi.');
        }

        $product->current_stock = $type === 'stock_in'
            ? $product->current_stock + $quantity
            : $product->current_stock - $quantity;
        $product->save();
    }

    private function reverseStock(Product $product, string $type, int $quantity): void
    {
        $product->current_stock = $type === 'stock_in'
            ? max(0, $product->current_stock - $quantity)
            : $product->current_stock + $quantity;
        $product->save();
    }

    private function audit(Request $request, string $action, StockTransaction $transaction, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'table_name' => 'stock_transactions',
            'record_id' => $transaction->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
