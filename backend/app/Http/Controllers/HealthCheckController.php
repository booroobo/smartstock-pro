<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    public function index()
    {
        try {
            DB::connection()->getPdo();
            $databaseStatus = 'connected';
        } catch (\Exception $e) {
            $databaseStatus = 'disconnected';
        }

        return response()->json([
            'success' => true,
            'message' => 'API is running',
            'data' => [
                'api_status' => 'online',
                'database_status' => $databaseStatus,
                'app_version' => '1.0.0',
                'timestamp' => now(),
            ]
        ]);
    }
}