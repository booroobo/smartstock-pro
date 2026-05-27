<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'message' => 'Data produk berhasil diambil', 'data' => $products]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_category_id' => 'required|exists:product_categories,id',
            'sku' => 'nullable|string|max:80',
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'minimum_stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:30',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $this->ownedCategory($request, $validated['product_category_id']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'user_id' => $request->user()->id,
            'current_stock' => 0,
            ...$validated,
        ]);

        $this->audit($request, 'create', $product, null, $product->toArray());

        return response()->json(['success' => true, 'message' => 'Produk berhasil dibuat', 'data' => $product->load('category')], 201);
    }

    public function show(Request $request, Product $product)
    {
        if ($product->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        return response()->json(['success' => true, 'message' => 'Detail produk berhasil diambil', 'data' => $product->load('category')]);
    }

    public function update(Request $request, Product $product)
    {
        if ($product->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $validated = $request->validate([
            'product_category_id' => 'required|exists:product_categories,id',
            'sku' => 'nullable|string|max:80',
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'minimum_stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:30',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $this->ownedCategory($request, $validated['product_category_id']);
        $oldValues = $product->toArray();

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);
        $this->audit($request, 'update', $product, $oldValues, $product->fresh()->toArray());

        return response()->json(['success' => true, 'message' => 'Produk berhasil diperbarui', 'data' => $product->fresh()->load('category')]);
    }

    public function destroy(Request $request, Product $product)
    {
        if ($product->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $oldValues = $product->toArray();
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();
        $this->audit($request, 'delete', $product, $oldValues, null);

        return response()->json(['success' => true, 'message' => 'Produk berhasil dihapus']);
    }

    private function ownedCategory(Request $request, int $id): ProductCategory
    {
        return ProductCategory::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
    }

    private function audit(Request $request, string $action, Product $product, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'table_name' => 'products',
            'record_id' => $product->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
