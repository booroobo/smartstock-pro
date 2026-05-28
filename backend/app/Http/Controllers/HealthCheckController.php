<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    public function index()
    {
        $startedAt = microtime(true);

        try {
            DB::select('select 1');
            $databaseStatus = 'connected';
        } catch (\Exception $e) {
            $databaseStatus = 'down';
        }

        $responseTimeMs = round((microtime(true) - $startedAt) * 1000, 2);

        return response()->json([
            'success' => true,
            'message' => 'API berjalan',
            'data' => [
                'api_status' => 'online',
                'database_status' => $databaseStatus,
                'response_time_ms' => $responseTimeMs,
                'app_version' => '1.0.0',
                'app_name' => config('app.name', 'SmartStock Pro'),
                'environment' => app()->environment(),
                'timestamp' => now(),
            ]
        ]);
    }
}
