<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@smartstock.com')->first();

        if (!$admin) {
            return;
        }

        $warehouses = [
            ['name' => 'Gudang Jakarta', 'location' => 'Jakarta', 'latitude' => -6.2088000, 'longitude' => 106.8456000],
            ['name' => 'Gudang Surabaya', 'location' => 'Surabaya', 'latitude' => -7.2575000, 'longitude' => 112.7521000],
            ['name' => 'Gudang Bandung', 'location' => 'Bandung', 'latitude' => -6.9175000, 'longitude' => 107.6191000],
            ['name' => 'Gudang Medan', 'location' => 'Medan', 'latitude' => 3.5952000, 'longitude' => 98.6722000],
            ['name' => 'Gudang Makassar', 'location' => 'Makassar', 'latitude' => -5.1477000, 'longitude' => 119.4327000],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::updateOrCreate(
                ['name' => $warehouse['name']],
                [
                    'user_id' => $admin->id,
                    'location' => $warehouse['location'],
                    'latitude' => $warehouse['latitude'],
                    'longitude' => $warehouse['longitude'],
                    'description' => 'Gudang demo SmartStock Pro untuk peta lokasi interaktif.',
                ]
            );
        }
    }
}
