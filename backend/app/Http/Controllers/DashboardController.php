<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalStockIn = StockTransaction::where('type', 'stock_in')
            ->sum('quantity');

        $totalStockOut = StockTransaction::where('type', 'stock_out')
            ->sum('quantity');

        $criticalStockProducts = Product::with('category')
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->orderBy('current_stock')
            ->get();

        $latestStockTransactions = StockTransaction::with(['product.category', 'warehouse'])
            ->latest()
            ->limit(5)
            ->get();

        $stockMovementByCategory = StockTransaction::query()
            ->join('products', 'stock_transactions.product_id', '=', 'products.id')
            ->join('product_categories', 'products.product_category_id', '=', 'product_categories.id')
            ->select(
                'product_categories.name as category',
                DB::raw("SUM(CASE WHEN stock_transactions.type = 'stock_in' THEN stock_transactions.quantity ELSE 0 END) as stock_in"),
                DB::raw("SUM(CASE WHEN stock_transactions.type = 'stock_out' THEN stock_transactions.quantity ELSE 0 END) as stock_out")
            )
            ->groupBy('product_categories.name')
            ->orderBy('product_categories.name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard inventory berhasil diambil',
            'data' => [
                'total_products' => Product::count(),
                'total_stock_in' => (int) $totalStockIn,
                'total_stock_out' => (int) $totalStockOut,
                'critical_stock_products' => $criticalStockProducts,
                'latest_stock_transactions' => $latestStockTransactions,
                'stock_movement_by_category' => $stockMovementByCategory,
            ],
        ]);
    }
}
