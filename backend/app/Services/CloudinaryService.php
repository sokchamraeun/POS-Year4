<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    protected Client $http;

    protected string $cloudName;

    protected string $apiKey;

    protected string $apiSecret;

    public function __construct()
    {
        $this->cloudName = config('services.cloudinary.cloud_name');
        $this->apiKey = config('services.cloudinary.api_key');
        $this->apiSecret = config('services.cloudinary.api_secret');

        $this->http = new Client([
            'base_uri' => "https://api.cloudinary.com/v1_1/{$this->cloudName}/",
            'auth' => [$this->apiKey, $this->apiSecret],
            'verify' => false,
        ]);
    }

    public function upload(UploadedFile $file, string $folder = 'products'): string
    {
        $response = $this->http->post('image/upload', [
            'multipart' => [
                [
                    'name' => 'file',
                    'contents' => fopen($file->getRealPath(), 'r'),
                ],
                [
                    'name' => 'folder',
                    'contents' => $folder,
                ],
            ],
        ]);

        $result = json_decode($response->getBody(), true);

        return $result['secure_url'];
    }

    public function delete(string $url): void
    {
        preg_match('/\/v\d+\/(.+)\.\w+$/', $url, $matches);
        if (empty($matches[1])) {
            return;
        }

        $publicId = $matches[1];
        $timestamp = time();

        $signature = sha1("public_id={$publicId}&timestamp={$timestamp}{$this->apiSecret}");

        $this->http->post('image/destroy', [
            'form_params' => [
                'public_id' => $publicId,
                'timestamp' => $timestamp,
                'signature' => $signature,
                'api_key' => $this->apiKey,
            ],
        ]);
    }
}
