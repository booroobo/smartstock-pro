<?php

namespace App\Http\Controllers;

use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $query = StockTransaction::with(['product.category', 'warehouse'])
            ->where('user_id', $request->user()->id);

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
