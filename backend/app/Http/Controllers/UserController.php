<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diambil',
            'data' => User::select('id', 'name', 'email', 'role', 'created_at')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'warehouse_manager', 'staff', 'viewer'])],
        ]);

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_role',
            'table_name' => 'users',
            'record_id' => $user->id,
            'description' => 'Mengubah role user ' . $user->email . ' dari ' . $oldRole . ' menjadi ' . $user->role,
            'ip_address' => $request->ip(),
            'old_values' => ['role' => $oldRole],
            'new_values' => ['role' => $user->role],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role user berhasil diperbarui',
            'data' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }
}
