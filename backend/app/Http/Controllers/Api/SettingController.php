<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Setting::current());
    }

    public function update(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'site_name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'footer_location' => 'nullable|string|max:255',
            'footer_phone' => 'nullable|string|max:50',
            'footer_email' => 'nullable|email|max:255',
            'hours_weekday' => 'nullable|string|max:100',
            'hours_saturday' => 'nullable|string|max:100',
            'hours_sunday' => 'nullable|string|max:100',
        ]);

        $setting = Setting::current();

        if ($request->hasFile('logo')) {
            if ($setting->logo) {
                $cloudinary->delete($setting->logo);
            }
            $data['logo'] = $cloudinary->upload($request->file('logo'), 'settings');
        } else {
            unset($data['logo']);
        }

        $setting->update($data);

        return response()->json($setting);
    }
}
