<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::with('user:id,name,email')
            ->latest()
            ->limit(100)
            ->get()
            ->map(function (AuditLog $log) {
                return [
                    'id' => $log->id,
                    'timestamp' => $log->created_at,
                    'user' => $log->user,
                    'action' => $log->action,
                    'module' => $log->table_name,
                    'description' => $log->description ?? ucfirst($log->action) . ' data ' . $log->table_name,
                    'ip_address' => $log->ip_address ?? '-',
                    'record_id' => $log->record_id,
                    'created_at' => $log->created_at,
                    'table_name' => $log->table_name,
                ];
            });

        return response()->json(['success' => true, 'message' => 'Audit log berhasil diambil', 'data' => $logs]);
    }
}
