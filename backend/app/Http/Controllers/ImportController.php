<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessProductImport;
use App\Models\AuditLog;
use App\Models\ImportJob;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    public function importProducts(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $validated['file'];
        $path = $file->store('imports');

        $importJob = ImportJob::create([
            'user_id' => $request->user()->id,
            'filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'import_requested',
            'table_name' => 'products',
            'record_id' => $importJob->id,
            'description' => 'User mengunggah CSV produk untuk diproses queue',
            'ip_address' => $request->ip(),
            'new_values' => ['filename' => $importJob->filename],
        ]);

        ProcessProductImport::dispatch($importJob->id);

        return response()->json([
            'success' => true,
            'message' => 'Import produk masuk ke antrian.',
            'data' => $importJob,
        ], 202);
    }

    public function jobs(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);

        return response()->json([
            'success' => true,
            'message' => 'Data import job berhasil diambil',
            'data' => ImportJob::with('user:id,name,email')->latest()->paginate($perPage),
        ]);
    }

    public function showJob(ImportJob $importJob)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail import job berhasil diambil',
            'data' => $importJob->load('user:id,name,email'),
        ]);
    }
}
