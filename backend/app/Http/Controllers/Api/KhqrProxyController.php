<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class KhqrProxyController extends Controller
{
    public function proxy(Request $request)
    {
        $url = $request->query('url');

        if (! $url) {
            return $this->htmlError('Missing url parameter');
        }

        $decoded = base64_decode($url, true);

        if (! $decoded || ! str_starts_with($decoded, 'https://khqr.cc/')) {
            return $this->htmlError('Invalid payment URL');
        }

        try {
            $response = Http::timeout(30)->get($decoded);

            $content = $response->body();
            $contentType = $response->header('Content-Type') ?? 'text/html; charset=utf-8';

            return response($content, $response->status())
                ->withHeaders([
                    'Content-Type' => $contentType,
                ]);
        } catch (\Exception $e) {
            return $this->htmlError('Failed to load payment page: '.$e->getMessage());
        }
    }

    private function htmlError(string $message)
    {
        $escaped = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

        return response(
            <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Error</title>
<style>
  body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151}
  .box{text-align:center;padding:2rem}
  h2{color:#dc2626;margin:0 0 .5rem}
  p{color:#6b7280;font-size:14px;margin:0}
</style>
</head>
<body><div class="box"><h2>Error</h2><p>{$escaped}</p></div></body>
</html>
HTML,
            400,
            ['Content-Type' => 'text/html; charset=utf-8']
        );
    }
}
