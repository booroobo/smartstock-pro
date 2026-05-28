<?php

namespace App\Http\Controllers;

use App\Models\StockTransaction;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $query = StockTransaction::with(['product.category', 'warehouse', 'user']);

        if ($request->filled('start_date')) {
            $query->whereDate('transaction_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('transaction_date', '<=', $request->end_date);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->orderByDesc('transaction_date')->get();

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'export',
            'table_name' => 'reports',
            'record_id' => null,
            'description' => 'Export laporan transaksi stok ke CSV',
            'ip_address' => $request->ip(),
            'new_values' => [
                'filters' => $request->only(['start_date', 'end_date', 'type']),
                'total_rows' => $transactions->count(),
            ],
        ]);

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Tanggal', 'Produk', 'Kategori', 'Gudang', 'Tipe', 'Quantity', 'Catatan']);

            foreach ($transactions as $transaction) {
                fputcsv($handle, [
                    $transaction->transaction_date,
                    $transaction->product?->name,
                    $transaction->product?->category?->name,
                    $transaction->warehouse?->name,
                    $transaction->type,
                    $transaction->quantity,
                    $transaction->notes,
                ]);
            }

            fclose($handle);
        }, 'smartstock-report.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
