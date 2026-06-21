<?php

use Illuminate\Support\Facades\Schema;

echo 'order_items has sugar_note: '.(Schema::hasColumn('order_items', 'sugar_note') ? 'yes' : 'no')."\n";
echo 'order_items has ice_note: '.(Schema::hasColumn('order_items', 'ice_note') ? 'yes' : 'no')."\n";
echo 'sugar_levels has requires_input: '.(Schema::hasColumn('sugar_levels', 'requires_input') ? 'yes' : 'no')."\n";
echo 'ice_levels has requires_input: '.(Schema::hasColumn('ice_levels', 'requires_input') ? 'yes' : 'no')."\n";

$s = App\Models\SugarLevel::create(['name' => '__smoke_extra', 'requires_input' => true]);
$fresh = App\Models\SugarLevel::find($s->id);
echo 'requires_input cast is bool true: '.($fresh->requires_input === true ? 'yes' : 'no')."\n";
$s->delete();
echo "cleanup done\n";
