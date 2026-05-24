<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SocketService
{
    protected string $serverUrl;

    protected string $secret;

    public function __construct()
    {
        $this->serverUrl = config('services.socket.url', 'http://127.0.0.1:3001');
        $this->secret = config('services.socket.secret', 'pos-secret-key');
    }

    public function emit(string $event, array $data = []): void
    {
        try {
            Http::timeout(1)->post("{$this->serverUrl}/emit", [
                'event' => $event,
                'data' => $data,
                'secret' => $this->secret,
            ]);
        } catch (\Throwable) {
            // Socket server unreachable — skip silently
        }
    }

    public function orderCreated(array $order): void
    {
        $this->emit('order:created', $order);
    }

    public function orderUpdated(array $order): void
    {
        $this->emit('order:updated', $order);
    }
}
