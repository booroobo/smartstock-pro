<?php

namespace App\Http\Controllers;

use App\Models\ErrorLog;
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
        $uptimeStatus = $databaseStatus === 'down'
            ? 'down'
            : ($responseTimeMs > 1000 ? 'warning' : 'healthy');

        if ($uptimeStatus === 'warning') {
            $recentWarningExists = ErrorLog::where('source', 'health_check')
                ->where('severity', 'warning')
                ->where('created_at', '>=', now()->subMinutes(5))
                ->exists();

            if (!$recentWarningExists) {
                ErrorLog::create([
                    'severity' => 'warning',
                    'source' => 'health_check',
                    'message' => 'Response time API melebihi threshold 1000 ms.',
                    'context' => ['response_time_ms' => $responseTimeMs],
                    'ip_address' => request()->ip(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'API berjalan',
            'data' => [
                'api_status' => 'online',
                'database_status' => $databaseStatus,
                'response_time_ms' => $responseTimeMs,
                'uptime_status' => $uptimeStatus,
                'memory_usage' => memory_get_usage(true),
                'memory_peak_usage' => memory_get_peak_usage(true),
                'php_version' => PHP_VERSION,
                'server_time' => now(),
                'app_version' => '1.0.0',
                'app_name' => config('app.name', 'SmartStock Pro'),
                'environment' => app()->environment(),
                'timestamp' => now(),
            ]
        ]);
    }
}
