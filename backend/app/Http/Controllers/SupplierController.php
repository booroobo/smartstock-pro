<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = Supplier::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Data supplier berhasil diambil',
            'data' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'contact_person' => 'nullable|string|max:120',
            'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
        ]);

        $supplier = Supplier::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        $this->audit($request, 'create', $supplier, null, $supplier->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Supplier berhasil dibuat',
            'data' => $supplier,
        ], 201);
    }

    public function show(Request $request, Supplier $supplier)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail supplier berhasil diambil',
            'data' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'contact_person' => 'nullable|string|max:120',
            'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
        ]);

        $oldValues = $supplier->toArray();
        $supplier->update($validated);
        $this->audit($request, 'update', $supplier, $oldValues, $supplier->fresh()->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Supplier berhasil diperbarui',
            'data' => $supplier->fresh(),
        ]);
    }

    public function destroy(Request $request, Supplier $supplier)
    {
        $oldValues = $supplier->toArray();
        $supplier->delete();
        $this->audit($request, 'delete', $supplier, $oldValues, null);

        return response()->json([
            'success' => true,
            'message' => 'Supplier berhasil dihapus',
        ]);
    }

    private function audit(Request $request, string $action, Supplier $supplier, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'table_name' => 'suppliers',
            'record_id' => $supplier->id,
            'description' => ucfirst($action) . ' supplier ' . $supplier->name,
            'ip_address' => $request->ip(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
