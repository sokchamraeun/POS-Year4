<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@test.com'],
            ['name' => 'Admin User', 'role_id' => 1, 'must_change_password' => true, 'password' => bcrypt('password')],
        );
        User::firstOrCreate(
            ['email' => 'manager@test.com'],
            ['name' => 'Manager User', 'role_id' => 2, 'must_change_password' => true, 'password' => bcrypt('password')],
        );
        User::firstOrCreate(
            ['email' => 'staff1@test.com'],
            ['name' => 'Staff One', 'role_id' => 3, 'must_change_password' => true, 'password' => bcrypt('password')],
        );
        User::firstOrCreate(
            ['email' => 'staff2@test.com'],
            ['name' => 'Staff Two', 'role_id' => 3, 'must_change_password' => true, 'password' => bcrypt('password')],
        );
        User::firstOrCreate(
            ['email' => 'staff3@test.com'],
            ['name' => 'Staff Three', 'role_id' => 3, 'must_change_password' => true, 'password' => bcrypt('password')],
        );
    }
}
