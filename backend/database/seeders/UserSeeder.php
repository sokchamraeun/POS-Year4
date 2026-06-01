<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create(['name' => 'Admin User', 'email' => 'admin@test.com', 'role_id' => 1, 'must_change_password' => true]);
        User::factory()->create(['name' => 'Manager User', 'email' => 'manager@test.com', 'role_id' => 2, 'must_change_password' => true]);
        User::factory()->create(['name' => 'Staff One', 'email' => 'staff1@test.com', 'role_id' => 3, 'must_change_password' => true]);
        User::factory()->create(['name' => 'Staff Two', 'email' => 'staff2@test.com', 'role_id' => 3, 'must_change_password' => true]);
        User::factory()->create(['name' => 'Staff Three', 'email' => 'staff3@test.com', 'role_id' => 3, 'must_change_password' => true]);
    }
}
