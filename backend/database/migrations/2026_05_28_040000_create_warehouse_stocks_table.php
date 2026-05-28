<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('warehouse_stocks')) {
            Schema::create('warehouse_stocks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
                $table->integer('quantity')->default(0);
                $table->integer('minimum_stock')->nullable();
                $table->timestamps();
                $table->unique(['product_id', 'warehouse_id']);
            });
        }

        $defaultWarehouseId = DB::table('warehouses')->orderBy('id')->value('id');

        if ($defaultWarehouseId) {
            DB::table('products')
                ->where('current_stock', '>', 0)
                ->orderBy('id')
                ->chunkById(100, function ($products) use ($defaultWarehouseId) {
                    foreach ($products as $product) {
                        DB::table('warehouse_stocks')->updateOrInsert(
                            [
                                'product_id' => $product->id,
                                'warehouse_id' => $defaultWarehouseId,
                            ],
                            [
                                'quantity' => $product->current_stock,
                                'minimum_stock' => $product->minimum_stock,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );
                    }
                });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_stocks');
    }
};
