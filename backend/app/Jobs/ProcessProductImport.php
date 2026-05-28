<?php

namespace App\Jobs;

use App\Models\AuditLog;
use App\Models\ErrorLog;
use App\Models\ImportJob;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessProductImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $importJobId
    ) {
    }

    public function handle(): void
    {
        $importJob = ImportJob::findOrFail($this->importJobId);
        $importJob->update(['status' => 'processing', 'error_message' => null]);

        $totalRows = 0;
        $successRows = 0;
        $failedRows = 0;
        $errors = [];

        try {
            $path = Storage::path($importJob->file_path);
            $handle = fopen($path, 'r');

            if (!$handle) {
                throw new \RuntimeException('File import tidak dapat dibaca.');
            }

            $headers = fgetcsv($handle);
            if (!$headers) {
                throw new \RuntimeException('CSV kosong atau header tidak valid.');
            }

            $headers = array_map(fn ($header) => trim(str_replace("\xEF\xBB\xBF", '', strtolower($header))), $headers);
            $requiredHeaders = ['sku', 'name', 'category', 'warehouse', 'supplier', 'current_stock', 'minimum_stock', 'unit_price'];
            $missingHeaders = array_diff($requiredHeaders, $headers);

            if (!empty($missingHeaders)) {
                throw new \RuntimeException('Header CSV tidak lengkap: ' . implode(', ', $missingHeaders));
            }

            while (($row = fgetcsv($handle)) !== false) {
                if ($this->isEmptyRow($row)) {
                    continue;
                }

                $totalRows++;
                $data = array_combine($headers, array_pad($row, count($headers), null));

                try {
                    $this->processRow($data, $importJob->user_id);
                    $successRows++;
                } catch (Throwable $exception) {
                    $failedRows++;
                    $errors[] = 'Baris ' . ($totalRows + 1) . ': ' . $exception->getMessage();
                }

                $importJob->update([
                    'total_rows' => $totalRows,
                    'success_rows' => $successRows,
                    'failed_rows' => $failedRows,
                ]);
            }

            fclose($handle);

            $importJob->update([
                'status' => $failedRows > 0 ? 'failed' : 'completed',
                'total_rows' => $totalRows,
                'success_rows' => $successRows,
                'failed_rows' => $failedRows,
                'error_message' => $failedRows > 0 ? implode("\n", array_slice($errors, 0, 20)) : null,
            ]);

            AuditLog::create([
                'user_id' => $importJob->user_id,
                'action' => 'import',
                'table_name' => 'products',
                'record_id' => $importJob->id,
                'description' => 'Import CSV produk selesai',
                'new_values' => [
                    'filename' => $importJob->filename,
                    'total_rows' => $totalRows,
                    'success_rows' => $successRows,
                    'failed_rows' => $failedRows,
                ],
            ]);
        } catch (Throwable $exception) {
            $importJob->update([
                'status' => 'failed',
                'total_rows' => $totalRows,
                'success_rows' => $successRows,
                'failed_rows' => $failedRows,
                'error_message' => $exception->getMessage(),
            ]);

            ErrorLog::create([
                'severity' => 'critical',
                'source' => 'import.products',
                'message' => 'Import CSV produk gagal.',
                'context' => ['import_job_id' => $importJob->id, 'error' => $exception->getMessage()],
                'user_id' => $importJob->user_id,
            ]);

            throw $exception;
        }
    }

    private function processRow(array $data, ?int $userId): void
    {
        $sku = trim((string) ($data['sku'] ?? ''));
        $name = trim((string) ($data['name'] ?? ''));

        if ($sku === '' || $name === '') {
            throw new \InvalidArgumentException('SKU dan name wajib diisi.');
        }

        DB::transaction(function () use ($data, $userId, $sku, $name) {
            $categoryName = trim((string) ($data['category'] ?? 'Umum')) ?: 'Umum';
            $warehouseName = trim((string) ($data['warehouse'] ?? 'Gudang Utama')) ?: 'Gudang Utama';
            $supplierName = trim((string) ($data['supplier'] ?? ''));

            $category = ProductCategory::firstOrCreate(
                ['name' => $categoryName],
                ['user_id' => $userId, 'description' => 'Dibuat otomatis dari import CSV.']
            );

            $warehouse = Warehouse::firstOrCreate(
                ['name' => $warehouseName],
                ['user_id' => $userId, 'location' => $warehouseName, 'description' => 'Dibuat otomatis dari import CSV.']
            );

            $supplier = null;
            if ($supplierName !== '') {
                $supplier = Supplier::firstOrCreate(
                    ['name' => $supplierName],
                    ['user_id' => $userId]
                );
            }

            $product = Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'user_id' => $userId,
                    'product_category_id' => $category->id,
                    'supplier_id' => $supplier?->id,
                    'name' => $name,
                    'minimum_stock' => max(0, (int) ($data['minimum_stock'] ?? 0)),
                    'unit_price' => max(0, (float) ($data['unit_price'] ?? 0)),
                    'unit' => 'pcs',
                    'description' => 'Diimpor dari CSV produk.',
                ]
            );

            WarehouseStock::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                ],
                [
                    'quantity' => max(0, (int) ($data['current_stock'] ?? 0)),
                    'minimum_stock' => max(0, (int) ($data['minimum_stock'] ?? 0)),
                ]
            );

            $product->current_stock = (int) WarehouseStock::where('product_id', $product->id)->sum('quantity');
            $product->save();
        });
    }

    private function isEmptyRow(array $row): bool
    {
        return count(array_filter($row, fn ($value) => trim((string) $value) !== '')) === 0;
    }
}
