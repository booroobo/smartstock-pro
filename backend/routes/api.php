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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ErrorLogController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ReportJobController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\UserController;

Route::get('/health', [HealthCheckController::class, 'index']);

// Register publik dinonaktifkan. Akun internal dibuat melalui database seeder.
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:admin,warehouse_manager,staff,viewer')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/reports/export', [ReportController::class, 'export']);
        Route::get('/reports/jobs', [ReportJobController::class, 'jobs']);
        Route::get('/reports/jobs/{reportJob}', [ReportJobController::class, 'showJob']);
        Route::get('/reports/jobs/{reportJob}/download', [ReportJobController::class, 'download']);
        Route::get('/notifications/critical-stock', [NotificationController::class, 'criticalStock']);
        Route::get('/stock-transactions', [TransactionController::class, 'index']);
        Route::get('/stock-transfers', [StockTransferController::class, 'index']);
        Route::get('/stock-transfers/{stockTransfer}', [StockTransferController::class, 'show']);
    });

    Route::middleware('role:admin,warehouse_manager,staff')->group(function () {
        Route::apiResource('/transactions', TransactionController::class);
        Route::apiResource('/stock-transactions', TransactionController::class)->parameters([
            'stock-transactions' => 'transaction',
        ]);
        Route::post('/stock-transfers', [StockTransferController::class, 'store']);

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
        Route::get('/error-logs/summary', [ErrorLogController::class, 'summary']);
        Route::get('/error-logs', [ErrorLogController::class, 'index']);
        Route::post('/import/products', [ImportController::class, 'importProducts']);
        Route::get('/import/jobs', [ImportController::class, 'jobs']);
        Route::get('/import/jobs/{importJob}', [ImportController::class, 'showJob']);
        Route::post('/reports/generate', [ReportJobController::class, 'generate']);
        Route::get('/users', [UserController::class, 'index'])->middleware('role:admin');
        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])->middleware('role:admin');
    });
});
