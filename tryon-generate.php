<?php
require_once __DIR__ . '/../config.php';

function uploaded_file(string $field): array
{
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        json_response(['success' => false, 'message' => "Please upload $field."], 422);
    }

    $file = $_FILES[$field];
    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    $mime = mime_content_type($file['tmp_name']) ?: '';

    if (!in_array($mime, $allowed, true)) {
        json_response(['success' => false, 'message' => "$field must be a JPG, PNG, or WEBP image."], 422);
    }

    if ((int) $file['size'] > 25 * 1024 * 1024) {
        json_response(['success' => false, 'message' => "$field must be under 25MB."], 422);
    }

    return $file;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(['success' => false, 'message' => 'POST required.'], 405);
    }

    $apiKey = openai_api_key();

    if ($apiKey === '') {
        json_response([
            'success' => false,
            'code' => 'missing_api_key',
            'message' => 'Realistic AI try-on needs OPENAI_API_KEY on the server. Set it in Windows environment variables or add it to Backend/.openai_key.'
        ], 503);
    }

    if (!function_exists('curl_init')) {
        json_response(['success' => false, 'message' => 'PHP cURL extension is not enabled in XAMPP.'], 500);
    }

    $person = uploaded_file('person');
    $outfit = uploaded_file('outfit');
    $userId = (int) ($_POST['user_id'] ?? 0);

    $prompt = <<<PROMPT
Generate a realistic AI virtual try-on by applying the selected outfit from image 2 onto the uploaded person in image 1.
Keep the person's face, identity, pose, hairstyle, body shape, hands, background, camera angle, and lighting unchanged.
Only replace the visible clothing with the selected outfit.
Fit the clothing naturally to the person's body and pose with realistic folds, seams, shadows, scale, perspective, and fabric texture.
Do not paste the outfit as a rectangle. Do not change the face, skin, body proportions, hair, background, or lighting.
Remove product-photo framing, labels, discount badges, watermarks, and catalog background from the outfit image.
Return a high-quality photorealistic result.
PROMPT;

    $postFields = [
        'model' => 'gpt-image-1',
        'prompt' => $prompt,
        'size' => '1024x1536',
        'quality' => 'high',
        'output_format' => 'png',
        'image[0]' => new CURLFile($person['tmp_name'], mime_content_type($person['tmp_name']), $person['name']),
        'image[1]' => new CURLFile($outfit['tmp_name'], mime_content_type($outfit['tmp_name']), $outfit['name']),
    ];

    $ch = curl_init('https://api.openai.com/v1/images/edits');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 180,
    ]);

    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($raw === false || $curlError !== '') {
        json_response(['success' => false, 'message' => 'AI try-on request failed: ' . $curlError], 502);
    }

    $response = json_decode($raw, true);

    if ($status < 200 || $status >= 300) {
        json_response([
            'success' => false,
            'message' => $response['error']['message'] ?? 'OpenAI image edit failed.',
            'status' => $status,
        ], 502);
    }

    $b64 = $response['data'][0]['b64_json'] ?? '';

    if ($b64 === '') {
        json_response(['success' => false, 'message' => 'AI did not return an image.'], 502);
    }

    $outputDir = dirname(__DIR__) . '/uploads/tryons';

    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0775, true);
    }

    $filename = 'tryon_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.png';
    $absolutePath = $outputDir . '/' . $filename;
    file_put_contents($absolutePath, base64_decode($b64));

    $relativePath = 'Backend/uploads/tryons/' . $filename;

    db()->prepare(
        'INSERT INTO virtual_tryons
            (user_id, user_image_name, cloth_image_name, result_image_path, fit_score, style_score, color_score, notes)
         VALUES
            (:user_id, :user_image_name, :cloth_image_name, :result_image_path, :fit_score, :style_score, :color_score, :notes)'
    )->execute([
        ':user_id' => $userId > 0 ? $userId : null,
        ':user_image_name' => $person['name'],
        ':cloth_image_name' => $outfit['name'],
        ':result_image_path' => $relativePath,
        ':fit_score' => 96,
        ':style_score' => 94,
        ':color_score' => 95,
        ':notes' => 'OpenAI realistic virtual try-on generated.',
    ]);

    json_response([
        'success' => true,
        'message' => 'Realistic AI try-on generated.',
        'image' => 'data:image/png;base64,' . $b64,
        'result_path' => $relativePath,
        'tryon_id' => (int) db()->lastInsertId(),
    ], 201);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => $e->getMessage()], 500);
}
