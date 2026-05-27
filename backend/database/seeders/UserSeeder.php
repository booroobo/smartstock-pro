<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin SmartStock',
                'email' => 'admin@smartstock.com',
                'role' => 'admin',
            ],
            [
                'name' => 'Manajer Gudang',
                'email' => 'manager@smartstock.com',
                'role' => 'warehouse_manager',
            ],
            [
                'name' => 'Staf Gudang',
                'email' => 'staff@smartstock.com',
                'role' => 'staff',
            ],
            [
                'name' => 'Viewer',
                'email' => 'viewer@smartstock.com',
                'role' => 'viewer',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password123'),
                    'role' => $user['role'],
                ]
            );
        }
    }
}
