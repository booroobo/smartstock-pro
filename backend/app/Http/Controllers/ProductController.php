<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ErrorLog;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);
        $sortBy = in_array($request->input('sort_by'), ['name', 'sku', 'current_stock', 'minimum_stock', 'unit_price', 'created_at', 'updated_at'], true)
            ? $request->input('sort_by')
            : 'created_at';
        $sortDirection = strtolower($request->input('sort_direction')) === 'asc' ? 'asc' : 'desc';

        $query = Product::with(['category', 'supplier', 'warehouseStocks.warehouse']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('sku', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('product_category_id', $request->category_id);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->whereHas('warehouseStocks', function ($q) use ($request) {
                $q->where('warehouse_id', $request->warehouse_id);
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'out_of_stock') {
                $query->where('current_stock', '<=', 0);
            } elseif ($request->status === 'low_stock') {
                $query->where('current_stock', '>', 0)
                    ->whereColumn('current_stock', '<=', 'minimum_stock');
            } elseif ($request->status === 'in_stock') {
                $query->whereColumn('current_stock', '>', 'minimum_stock');
            }
        }

        $products = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json(['success' => true, 'message' => 'Data produk berhasil diambil', 'data' => $products]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_category_id' => 'required|exists:product_categories,id',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'sku' => 'nullable|string|max:80',
                'name' => 'required|string|max:150',
                'description' => 'nullable|string',
                'minimum_stock' => 'required|integer|min:0',
                'unit_price' => 'nullable|numeric|min:0|max:9999999999999.99',
                'unit' => 'required|string|max:30',
                'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ]);
        } catch (ValidationException $exception) {
            $this->logImageValidationError($request, $exception);
            throw $exception;
        }

        $this->findCategory($validated['product_category_id']);
        if (!empty($validated['supplier_id'])) {
            Supplier::findOrFail($validated['supplier_id']);
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'user_id' => $request->user()->id,
            'current_stock' => 0,
            ...$validated,
        ]);

        $this->audit($request, 'create', $product, null, $product->toArray());

        return response()->json(['success' => true, 'message' => 'Produk berhasil dibuat', 'data' => $product->load(['category', 'supplier', 'warehouseStocks.warehouse'])], 201);
    }

    public function show(Request $request, Product $product)
    {
        return response()->json(['success' => true, 'message' => 'Detail produk berhasil diambil', 'data' => $product->load(['category', 'supplier', 'warehouseStocks.warehouse'])]);
    }

    public function update(Request $request, Product $product)
    {
        try {
            $validated = $request->validate([
                'product_category_id' => 'required|exists:product_categories,id',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'sku' => 'nullable|string|max:80',
                'name' => 'required|string|max:150',
                'description' => 'nullable|string',
                'minimum_stock' => 'required|integer|min:0',
                'unit_price' => 'nullable|numeric|min:0|max:9999999999999.99',
                'unit' => 'required|string|max:30',
                'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ]);
        } catch (ValidationException $exception) {
            $this->logImageValidationError($request, $exception);
            throw $exception;
        }

        $this->findCategory($validated['product_category_id']);
        if (!empty($validated['supplier_id'])) {
            Supplier::findOrFail($validated['supplier_id']);
        }
        $oldValues = $product->toArray();

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);
        $this->audit($request, 'update', $product, $oldValues, $product->fresh()->toArray());

        return response()->json(['success' => true, 'message' => 'Produk berhasil diperbarui', 'data' => $product->fresh()->load(['category', 'supplier', 'warehouseStocks.warehouse'])]);
    }

    public function destroy(Request $request, Product $product)
    {
        $oldValues = $product->toArray();
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();
        $this->audit($request, 'delete', $product, $oldValues, null);

        return response()->json(['success' => true, 'message' => 'Produk berhasil dihapus']);
    }

    private function findCategory(int $id): ProductCategory
    {
        return ProductCategory::findOrFail($id);
    }

    private function audit(Request $request, string $action, Product $product, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'table_name' => 'products',
            'record_id' => $product->id,
            'description' => ucfirst($action) . ' produk ' . $product->name,
            'ip_address' => $request->ip(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }

    private function logImageValidationError(Request $request, ValidationException $exception): void
    {
        if (!array_key_exists('image', $exception->errors())) {
            return;
        }

        ErrorLog::create([
            'severity' => 'warning',
            'source' => 'products.upload',
            'message' => 'Validasi upload gambar produk gagal.',
            'context' => ['errors' => $exception->errors()],
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
        ]);
    }
}
