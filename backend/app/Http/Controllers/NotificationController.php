<?php

namespace App\Http\Controllers;

use App\Models\Product;

class NotificationController extends Controller
{
    public function criticalStock()
    {
        $products = Product::with(['category', 'supplier'])
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->orderBy('current_stock')
            ->get()
            ->map(function (Product $product) {
                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'current_stock' => $product->current_stock,
                    'minimum_stock' => $product->minimum_stock,
                    'warehouse' => 'Semua gudang',
                    'status' => $product->current_stock <= 0 ? 'out_of_stock' : 'low_stock',
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi stok kritis berhasil diambil',
            'data' => [
                'total_critical_stock' => $products->count(),
                'products' => $products,
            ],
        ]);
    }
}
