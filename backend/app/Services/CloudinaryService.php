<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;

class CloudinaryService
{
    private $cloudinary;
    
    public function __construct()
    {
        // Initialize Cloudinary with configuration
        $config = [
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key' => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ];
        
        // Add SSL bypass for local development
        if (config('app.env') === 'local') {
            $config['url'] = [
                'secure' => false, // Use HTTP instead of HTTPS for local development
            ];
        }
        
        $this->cloudinary = new Cloudinary($config);
    }
    
    /**
     * Upload an image to Cloudinary with SSL configuration
     */
    public function uploadImage($imageData, $options = [])
    {
        try {
            // Set default options
            $defaultOptions = [
                'overwrite' => true,
                'transformation' => [
                    'width' => 400,
                    'height' => 400,
                    'crop' => 'fill',
                    'quality' => 'auto'
                ]
            ];
            
            $uploadOptions = array_merge($defaultOptions, $options);
            
            // For local development, add cURL options to bypass SSL
            if (config('app.env') === 'local') {
                $uploadOptions['curl'] = [
                    CURLOPT_SSL_VERIFYHOST => 0,
                    CURLOPT_SSL_VERIFYPEER => 0,
                    CURLOPT_TIMEOUT => 30,
                ];
                \Log::info('CloudinaryService: Using local development SSL bypass');
            }
            
            \Log::info('CloudinaryService: Starting upload with options', [
                'environment' => config('app.env'),
                'has_curl_options' => isset($uploadOptions['curl']),
                'image_data_type' => is_string($imageData) ? 'string' : gettype($imageData),
                'image_size' => is_string($imageData) ? strlen($imageData) : 0
            ]);
            
            $result = $this->cloudinary->uploadApi()->upload($imageData, $uploadOptions);
            
            \Log::info('CloudinaryService: Upload successful', [
                'public_id' => $result['public_id'] ?? null,
                'secure_url' => $result['secure_url'] ?? null
            ]);
            
            return $result;
        } catch (\Exception $e) {
            \Log::error('CloudinaryService: Upload failed', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    
    /**
     * Delete an image from Cloudinary
     */
    public function deleteImage($publicId)
    {
        try {
            $options = [];
            
            // For local development, add cURL options to bypass SSL
            if (config('app.env') === 'local') {
                $options['curl'] = [
                    CURLOPT_SSL_VERIFYHOST => 0,
                    CURLOPT_SSL_VERIFYPEER => 0,
                    CURLOPT_TIMEOUT => 30,
                ];
                \Log::info('CloudinaryService: Using local development SSL bypass for delete');
            }
            
            \Log::info('CloudinaryService: Starting image deletion', [
                'public_id' => $publicId,
                'environment' => config('app.env')
            ]);
            
            $result = $this->cloudinary->uploadApi()->destroy($publicId, $options);
            
            \Log::info('CloudinaryService: Deletion result', [
                'result' => $result
            ]);
            
            return $result;
        } catch (\Exception $e) {
            \Log::error('CloudinaryService: Delete failed', [
                'public_id' => $publicId,
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ]);
            throw $e;
        }
    }
}