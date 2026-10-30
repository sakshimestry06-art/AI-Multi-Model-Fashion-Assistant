<?php
declare(strict_types=1);

require_once __DIR__ . '/tryon_config.php';
require_once __DIR__ . '/Backend/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Private-Network: true');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const MAX_UPLOAD_BYTES = 8_388_608; // 8 MB, helps avoid memory pressure on local XAMPP.
const GRADIO_TIMEOUT_SECONDS = 90;

function respond_json(array $payload, int $httpStatus = 200): void
{
    http_response_code($httpStatus);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function safe_error(string $message, int $httpStatus = 400): void
{
    respond_json([
        'status' => 'error',
        'message' => $message,
    ], $httpStatus);
}

function validate_uploaded_photo(string $field): array
{
    if (!isset($_FILES[$field]) || !is_array($_FILES[$field])) {
        safe_error('Please upload a user photo.', 422);
    }

    $file = $_FILES[$field];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        safe_error('The user photo could not be uploaded. Please try again.', 400);
    }

    if (($file['size'] ?? 0) <= 0 || ($file['size'] ?? 0) > MAX_UPLOAD_BYTES) {
        safe_error('The user photo must be a valid image under 8 MB.', 413);
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        safe_error('Invalid upload request.', 400);
    }

    $mime = mime_content_type($file['tmp_name']) ?: '';
    if (!in_array($mime, ['image/jpeg', 'image/png'], true)) {
        safe_error('Only JPG and PNG photos are supported.', 415);
    }

    return [
        'tmp_name' => $file['tmp_name'],
        'mime' => $mime,
        'name' => sanitize_image_name((string) ($file['name'] ?? 'source.jpg'), 'source.jpg'),
    ];
}

function validate_tryon_category(string $category): string
{
    $allowedCategories = ['Upper-body', 'Lower-body', 'Dress'];
    $normalizedCategory = trim($category);

    if (!in_array($normalizedCategory, $allowedCategories, true)) {
        safe_error('A valid clothing category is required.', 422);
    }

    return $normalizedCategory;
}

function sanitize_image_name(string $name, string $fallback): string
{
    $clean = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($name));
    if (!is_string($clean) || $clean === '' || !preg_match('/\.(jpg|jpeg|png)$/i', $clean)) {
        return $fallback;
    }

    return $clean;
}

function image_file_to_data_uri(string $absolutePath, string $forcedMime = ''): string
{
    if (!is_file($absolutePath) || !is_readable($absolutePath)) {
        safe_error('The selected image could not be loaded.', 404);
    }

    $size = filesize($absolutePath);
    if ($size === false || $size <= 0 || $size > MAX_UPLOAD_BYTES) {
        safe_error('The selected image is too large or invalid.', 413);
    }

    $mime = $forcedMime !== '' ? $forcedMime : (mime_content_type($absolutePath) ?: '');
    if (!in_array($mime, ['image/jpeg', 'image/png'], true)) {
        safe_error('The selected image must be JPG or PNG.', 415);
    }

    $bytes = file_get_contents($absolutePath);
    if ($bytes === false) {
        safe_error('The selected image could not be read.', 500);
    }

    return 'data:' . $mime . ';base64,' . base64_encode($bytes);
}

function get_catalog_image_for_product(int $productId): string
{
    try {
        $stmt = db()->prepare(
            'SELECT image_path
             FROM products
             WHERE id = :id AND is_active = 1
             LIMIT 1'
        );
        $stmt->execute([':id' => $productId]);
        $product = $stmt->fetch();
    } catch (Throwable $e) {
        error_log('tryon database lookup failed: ' . $e->getMessage());
        safe_error('Product details are temporarily unavailable.', 500);
    }

    if (!$product || trim((string) ($product['image_path'] ?? '')) === '') {
        safe_error('The selected product was not found.', 404);
    }

    $relativePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, (string) $product['image_path']);
    $baseDirs = [
        __DIR__,
        __DIR__ . DIRECTORY_SEPARATOR . 'Frontend',
        __DIR__ . DIRECTORY_SEPARATOR . 'Backend',
    ];

    foreach ($baseDirs as $baseDir) {
        $candidate = realpath($baseDir . DIRECTORY_SEPARATOR . $relativePath);
        $allowedBase = realpath($baseDir);

        if (
            $candidate !== false
            && $allowedBase !== false
            && str_starts_with($candidate, $allowedBase . DIRECTORY_SEPARATOR)
            && is_file($candidate)
        ) {
            return $candidate;
        }
    }

    safe_error('The product image is unavailable.', 404);
}

function ensure_demo_image(string $relativePath): string
{
    $safeRelative = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath), DIRECTORY_SEPARATOR);
    $fullPath = __DIR__ . DIRECTORY_SEPARATOR . $safeRelative;
    $directory = dirname($fullPath);

    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        safe_error('Demo output is temporarily unavailable.', 500);
    }

    if (!is_file($fullPath)) {
        $onePixelJpeg = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';
        file_put_contents($fullPath, base64_decode($onePixelJpeg));
    }

    return str_replace(DIRECTORY_SEPARATOR, '/', $safeRelative);
}

function extract_generated_image(array $gradioResponse): string
{
    $data = $gradioResponse['data'] ?? null;
    if (!is_array($data) || !array_key_exists(0, $data)) {
        safe_error('The AI service did not return an image.', 502);
    }

    $result = $data[0];
    if (is_string($result) && $result !== '') {
        return $result;
    }

    if (is_array($result)) {
        foreach (['data', 'url', 'image', 'path'] as $key) {
            if (isset($result[$key]) && is_string($result[$key]) && $result[$key] !== '') {
                return $result[$key];
            }
        }
    }

    safe_error('The AI result format was not recognized.', 502);
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        safe_error('Only POST requests are allowed.', 405);
    }

    $productId = filter_input(INPUT_POST, 'product_id', FILTER_VALIDATE_INT);
    if (!is_int($productId) || $productId <= 0) {
        safe_error('A valid product ID is required.', 422);
    }

    $category = validate_tryon_category((string) ($_POST['category'] ?? ''));

    $userPhoto = validate_uploaded_photo('user_photo');

    if ($development_mode === true) {
        sleep(3);
        $demoImage = ensure_demo_image($demo_output_path ?? 'uploads/demo_output.jpg');

        respond_json([
            'status' => 'success',
            'message' => 'Development mode mock try-on generated.',
            'image_url' => $demoImage,
            'development_mode' => true,
        ]);
    }

    if (!function_exists('curl_init')) {
        safe_error('The AI bridge is not available on this server.', 500);
    }

    $catalogImagePath = get_catalog_image_for_product($productId);

    $sourceDataUri = image_file_to_data_uri($userPhoto['tmp_name'], $userPhoto['mime']);
    $garmentDataUri = image_file_to_data_uri($catalogImagePath);

    $payload = [
        'data' => [
            [
                'data' => $sourceDataUri,
                'name' => $userPhoto['name'] ?: 'source.jpg',
            ],
            [
                'data' => $garmentDataUri,
                'name' => 'garment.jpg',
            ],
            $category,
            1,
            20,
            2,
            -1,
        ],
        'fn_index' => 1,
    ];

    $endpoint = rtrim((string) $colab_url, '/') . '/api/predict';
    $curl = curl_init($endpoint);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_CONNECTTIMEOUT => 20,
        CURLOPT_TIMEOUT => GRADIO_TIMEOUT_SECONDS,
        CURLOPT_FAILONERROR => false,
    ]);

    $rawResponse = curl_exec($curl);
    $curlErrorNumber = curl_errno($curl);
    $httpCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);

    if ($rawResponse === false || $curlErrorNumber !== 0) {
        error_log('tryon colab curl failed with code: ' . $curlErrorNumber);
        safe_error('The AI service is taking too long or is temporarily unavailable.', 504);
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        error_log('tryon colab http failure: ' . $httpCode);
        safe_error('The AI service returned an error. Please try again later.', 502);
    }

    $decoded = json_decode($rawResponse, true);
    if (!is_array($decoded)) {
        error_log('tryon colab returned invalid JSON');
        safe_error('The AI service returned an invalid response.', 502);
    }

    if (isset($decoded['error']) && $decoded['error'] !== null && $decoded['error'] !== '') {
        error_log('tryon colab application error');
        safe_error('The AI service could not generate this try-on image.', 502);
    }

    $generatedImage = extract_generated_image($decoded);

    respond_json([
        'status' => 'success',
        'message' => 'Virtual try-on generated successfully.',
        'image_url' => $generatedImage,
        'development_mode' => false,
    ]);
} catch (Throwable $e) {
    error_log('tryon_process unexpected failure: ' . $e->getMessage());
    safe_error('The virtual try-on request could not be completed.', 500);
}
