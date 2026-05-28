<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $warehouses = Warehouse::latest()->get();

        return response()->json(['success' => true, 'message' => 'Data gudang berhasil diambil', 'data' => $warehouses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'location' => 'nullable|string|max:150',
            'description' => 'nullable|string',
        ]);

        $warehouse = Warehouse::create(['user_id' => $request->user()->id, ...$validated]);
        $this->audit($request, 'create', $warehouse, null, $warehouse->toArray());

        return response()->json(['success' => true, 'message' => 'Gudang berhasil dibuat', 'data' => $warehouse], 201);
    }

    public function show(Request $request, Warehouse $warehouse)
    {
        return response()->json(['success' => true, 'message' => 'Detail gudang berhasil diambil', 'data' => $warehouse]);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'location' => 'nullable|string|max:150',
            'description' => 'nullable|string',
        ]);

        $oldValues = $warehouse->toArray();
        $warehouse->update($validated);
        $this->audit($request, 'update', $warehouse, $oldValues, $warehouse->fresh()->toArray());

        return response()->json(['success' => true, 'message' => 'Gudang berhasil diperbarui', 'data' => $warehouse]);
    }

    public function destroy(Request $request, Warehouse $warehouse)
    {
        $oldValues = $warehouse->toArray();
        $warehouse->delete();
        $this->audit($request, 'delete', $warehouse, $oldValues, null);

        return response()->json(['success' => true, 'message' => 'Gudang berhasil dihapus']);
    }

    private function audit(Request $request, string $action, Warehouse $warehouse, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'table_name' => 'warehouses',
            'record_id' => $warehouse->id,
            'description' => ucfirst($action) . ' gudang ' . $warehouse->name,
            'ip_address' => $request->ip(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
