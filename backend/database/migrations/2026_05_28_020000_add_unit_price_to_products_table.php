<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'unit_price')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('unit_price', 15, 2)->default(0)->after('minimum_stock');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('products', 'unit_price')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('unit_price');
        });
    }
};
