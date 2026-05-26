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
            ['name' => 'Admin User', 'email' => 'admin@test.com', 'password' => 'password', 'role_id' => 1],
            ['name' => 'Manager User', 'email' => 'manager@test.com', 'password' => 'password', 'role_id' => 2],
            ['name' => 'Staff One', 'email' => 'staff1@test.com', 'password' => 'password', 'role_id' => 3],
            ['name' => 'Staff Two', 'email' => 'staff2@test.com', 'password' => 'password', 'role_id' => 3],
            ['name' => 'Staff Three', 'email' => 'staff3@test.com', 'password' => 'password', 'role_id' => 3],
        ];

        foreach ($users as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make($user['password']),
                    'role_id' => $user['role_id'],
                ]
            );
        }
    }
}
