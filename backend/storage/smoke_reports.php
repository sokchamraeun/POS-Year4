<?php

$c = new App\Http\Controllers\Api\ReportController();

foreach (['sales', 'profit', 'payments', 'orders', 'staff'] as $m) {
    try {
        $r = $c->$m(new Illuminate\Http\Request(['from' => '2026-01-01', 'to' => '2026-12-31']));
        echo $m.' OK keys: '.implode(',', array_keys($r->getData(true)))."\n";
    } catch (\Throwable $e) {
        echo $m.' ERROR: '.$e->getMessage().' @ '.$e->getFile().':'.$e->getLine()."\n";
    }
}
