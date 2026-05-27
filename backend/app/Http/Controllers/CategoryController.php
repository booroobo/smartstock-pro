<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = ProductCategory::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data kategori berhasil diambil',
            'data' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $category = ProductCategory::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $this->audit($request, 'create', $category, null, $category->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dibuat',
            'data' => $category,
        ], 201);
    }

    public function show(Request $request, ProductCategory $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kategori berhasil diambil',
            'data' => $category,
        ]);
    }

    public function update(Request $request, ProductCategory $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $oldValues = $category->toArray();
        $category->update($validated);
        $this->audit($request, 'update', $category, $oldValues, $category->fresh()->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => $category,
        ]);
    }

    public function destroy(Request $request, ProductCategory $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $oldValues = $category->toArray();
        $category->delete();
        $this->audit($request, 'delete', $category, $oldValues, null);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus',
        ]);
    }

    private function audit(Request $request, string $action, ProductCategory $category, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'table_name' => 'product_categories',
            'record_id' => $category->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
