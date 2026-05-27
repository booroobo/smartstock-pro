<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::where('user_id', $request->user()->id)
            ->latest()
            ->limit(100)
            ->get();

        return response()->json(['success' => true, 'message' => 'Audit log berhasil diambil', 'data' => $logs]);
    }
}
