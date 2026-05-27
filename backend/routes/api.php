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

Route::get('/health', [HealthCheckController::class, 'index']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('/categories', CategoryController::class);
    Route::apiResource('/product-categories', CategoryController::class)->parameters([
        'product-categories' => 'category',
    ]);
    Route::apiResource('/products', ProductController::class);
    Route::apiResource('/warehouses', WarehouseController::class);
    Route::apiResource('/transactions', TransactionController::class);
    Route::apiResource('/stock-transactions', TransactionController::class)->parameters([
        'stock-transactions' => 'transaction',
    ]);
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    Route::get('/reports/export', [ReportController::class, 'export']);
});
