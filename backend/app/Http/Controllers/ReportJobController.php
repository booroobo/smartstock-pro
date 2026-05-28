<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateStockReportJob;
use App\Models\AuditLog;
use App\Models\ReportJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportJobController extends Controller
{
    public function generate(Request $request)
    {
        $reportJob = ReportJob::create([
            'user_id' => $request->user()->id,
            'type' => 'stock_transactions_csv',
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'generate_requested',
            'table_name' => 'reports',
            'record_id' => $reportJob->id,
            'description' => 'User meminta generate laporan stok background',
            'ip_address' => $request->ip(),
        ]);

        GenerateStockReportJob::dispatch($reportJob->id);

        return response()->json([
            'success' => true,
            'message' => 'Generate laporan masuk ke antrian.',
            'data' => $reportJob,
        ], 202);
    }

    public function jobs(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);

        return response()->json([
            'success' => true,
            'message' => 'Data report job berhasil diambil',
            'data' => ReportJob::with('user:id,name,email')->latest()->paginate($perPage),
        ]);
    }

    public function showJob(ReportJob $reportJob)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail report job berhasil diambil',
            'data' => $reportJob->load('user:id,name,email'),
        ]);
    }

    public function download(ReportJob $reportJob)
    {
        if ($reportJob->status !== 'completed' || !$reportJob->file_path || !Storage::exists($reportJob->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File laporan belum tersedia.',
            ], 404);
        }

        return Storage::download($reportJob->file_path, 'smartstock-background-report-' . $reportJob->id . '.csv');
    }
}
