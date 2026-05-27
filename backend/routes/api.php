<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\SupplierController;

Route::get('/health', [HealthCheckController::class, 'index']);

// Register publik dinonaktifkan. Akun internal dibuat melalui database seeder.
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:admin,warehouse_manager,staff,viewer')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/reports/export', [ReportController::class, 'export']);
    });

    Route::middleware('role:admin,warehouse_manager,staff')->group(function () {
        Route::apiResource('/transactions', TransactionController::class);
        Route::apiResource('/stock-transactions', TransactionController::class)->parameters([
            'stock-transactions' => 'transaction',
        ]);

        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{product}', [ProductController::class, 'show']);
        Route::get('/warehouses', [WarehouseController::class, 'index']);
        Route::get('/warehouses/{warehouse}', [WarehouseController::class, 'show']);
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
        Route::get('/product-categories', [CategoryController::class, 'index']);
        Route::get('/product-categories/{category}', [CategoryController::class, 'show']);
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    });

    Route::middleware('role:admin,warehouse_manager')->group(function () {
        Route::apiResource('/categories', CategoryController::class);
        Route::apiResource('/product-categories', CategoryController::class)->parameters([
            'product-categories' => 'category',
        ]);
        Route::apiResource('/products', ProductController::class)->except(['index', 'show']);
        Route::apiResource('/warehouses', WarehouseController::class)->except(['index', 'show']);
        Route::apiResource('/suppliers', SupplierController::class);
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
