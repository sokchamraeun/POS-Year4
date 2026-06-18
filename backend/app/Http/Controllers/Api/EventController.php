<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::orderBy('order')->orderByDesc('id')->get();

        return response()->json($events);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json($event);
    }

    public function store(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $data['image'] = $cloudinary->upload($request->file('image'), 'events');

        $event = Event::create($data);

        return response()->json($event, 201);
    }

    public function update(Request $request, Event $event, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $cloudinary->delete($event->image);
            $data['image'] = $cloudinary->upload($request->file('image'), 'events');
        } else {
            unset($data['image']);
        }

        $event->update($data);

        return response()->json($event);
    }

    public function destroy(Event $event, CloudinaryService $cloudinary): JsonResponse
    {
        $cloudinary->delete($event->image);
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}
