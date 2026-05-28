<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class OrderUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    private array $orderData;

    public function __construct(Order $order)
    {
        $this->orderData = $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy'])->toArray();
    }

    public function broadcastOn(): Channel
    {
        return new Channel('orders');
    }

    public function broadcastAs(): string
    {
        return 'order:updated';
    }

    public function broadcastWith(): array
    {
        return $this->orderData;
    }
}
