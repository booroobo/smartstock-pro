<?php

namespace App\Http\Controllers;

use App\Models\ErrorLog;
use Illuminate\Http\Request;

class ErrorLogController extends Controller
{
    public function summary()
    {
        $summary = ErrorLog::query()
            ->selectRaw('severity, COUNT(*) as total')
            ->groupBy('severity')
            ->pluck('total', 'severity');

        return response()->json([
            'success' => true,
            'message' => 'Ringkasan error log berhasil diambil',
            'data' => [
                'critical' => (int) ($summary['critical'] ?? 0),
                'warning' => (int) ($summary['warning'] ?? 0),
                'info' => (int) ($summary['info'] ?? 0),
            ],
        ]);
    }

    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = ErrorLog::with('user:id,name,email')->latest();

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('source', 'ilike', "%{$search}%")
                    ->orWhere('message', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data error log berhasil diambil',
            'data' => $query->paginate($perPage),
        ]);
    }
}
