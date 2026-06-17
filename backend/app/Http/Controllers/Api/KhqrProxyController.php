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
            $response = Http::timeout(30)
                ->withHeaders([
                    'User-Agent' => $request->userAgent() ?? 'Mozilla/5.0',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])
                ->get($decoded);

            $content = $response->body();
            $contentType = $response->header('Content-Type') ?? 'text/html; charset=utf-8';

            // For HTML, inject a <base> tag so the page's relative assets
            // (CSS/JS/images/form actions) still resolve against khqr.cc
            // instead of our proxy domain.
            if (str_contains(strtolower($contentType), 'text/html')) {
                $base = '<base href="'.htmlspecialchars($decoded, ENT_QUOTES).'">';

                if (preg_match('/<head[^>]*>/i', $content)) {
                    $content = preg_replace('/(<head[^>]*>)/i', '$1'.$base, $content, 1);
                } else {
                    $content = $base.$content;
                }
            }

            // Re-serve from our own origin, dropping any framing restrictions
            // (X-Frame-Options / CSP) so the page can be embedded in an iframe.
            return response($content, $response->status())
                ->withHeaders([
                    'Content-Type' => $contentType,
                    'X-Frame-Options' => 'ALLOWALL',
                    'Content-Security-Policy' => 'frame-ancestors *;',
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
