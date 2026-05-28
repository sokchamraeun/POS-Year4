<?php

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

if (! function_exists('dispatch_broadcast')) {
    function dispatch_broadcast(ShouldBroadcast $event): void
    {
        try {
            event($event);
        } catch (Throwable $e) {
            Log::warning('Broadcast failed: '.$e->getMessage());
        }
    }
}
