<?php

namespace App\Jobs;

use App\Models\AuditLog;
use App\Models\ErrorLog;
use App\Models\ReportJob;
use App\Models\StockTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GenerateStockReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $reportJobId
    ) {
    }

    public function handle(): void
    {
        $reportJob = ReportJob::findOrFail($this->reportJobId);
        $reportJob->update(['status' => 'processing', 'error_message' => null]);

        try {
            $transactions = StockTransaction::with(['product.category', 'warehouse', 'user'])
                ->orderByDesc('transaction_date')
                ->get();

            $path = 'reports/stock-report-' . $reportJob->id . '-' . now()->format('YmdHis') . '.csv';
            $handle = fopen('php://temp', 'r+');

            fputcsv($handle, ['Tanggal', 'Produk', 'SKU', 'Kategori', 'Gudang', 'Tipe', 'Quantity', 'Harga Satuan', 'Nilai Total', 'User', 'Catatan']);

            foreach ($transactions as $transaction) {
                $unitPrice = (float) ($transaction->product?->unit_price ?? 0);
                fputcsv($handle, [
                    $transaction->transaction_date,
                    $transaction->product?->name,
                    $transaction->product?->sku,
                    $transaction->product?->category?->name,
                    $transaction->warehouse?->name,
                    $transaction->type,
                    $transaction->quantity,
                    $unitPrice,
                    $unitPrice * (int) $transaction->quantity,
                    $transaction->user?->name,
                    $transaction->notes,
                ]);
            }

            rewind($handle);
            Storage::put($path, stream_get_contents($handle));
            fclose($handle);

            $reportJob->update([
                'status' => 'completed',
                'file_path' => $path,
            ]);

            AuditLog::create([
                'user_id' => $reportJob->user_id,
                'action' => 'generate',
                'table_name' => 'reports',
                'record_id' => $reportJob->id,
                'description' => 'Generate laporan stok background selesai',
                'new_values' => ['file_path' => $path, 'total_rows' => $transactions->count()],
            ]);
        } catch (Throwable $exception) {
            $reportJob->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);

            ErrorLog::create([
                'severity' => 'critical',
                'source' => 'reports.generate',
                'message' => 'Generate laporan background gagal.',
                'context' => ['report_job_id' => $reportJob->id, 'error' => $exception->getMessage()],
                'user_id' => $reportJob->user_id,
            ]);

            throw $exception;
        }
    }
}
