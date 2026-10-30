<?php
declare(strict_types=1);

$result = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $person = $_FILES['person_image'] ?? null;
    $cloth = $_FILES['cloth_image'] ?? null;

    if (!$person || !$cloth) {
        $error = 'Please upload both person and clothing images.';
    } elseif (($person['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || ($cloth['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $error = 'One or more uploads failed.';
    } else {
        $curl = curl_init('http://127.0.0.1:8000/tryon');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [
                'person_image' => new CURLFile(
                    $person['tmp_name'],
                    mime_content_type($person['tmp_name']),
                    basename($person['name'])
                ),
                'cloth_image' => new CURLFile(
                    $cloth['tmp_name'],
                    mime_content_type($cloth['tmp_name']),
                    basename($cloth['name'])
                ),
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 90,
        ]);

        $response = curl_exec($curl);
        $curlError = curl_error($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);

        if ($response === false) {
            $error = 'FastAPI server is unreachable: ' . $curlError;
        } else {
            $decoded = json_decode($response, true);

            if (!is_array($decoded)) {
                $error = 'FastAPI returned an invalid response.';
            } elseif ($status >= 400 || empty($decoded['success'])) {
                $error = (string) ($decoded['message'] ?? 'Try-on generation failed.');
            } else {
                $result = $decoded;
            }
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FashionAI Try-On Upload</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 760px;
            margin: 40px auto;
            padding: 0 20px;
            color: #111827;
        }

        form {
            display: grid;
            gap: 16px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }

        button {
            width: fit-content;
            padding: 10px 16px;
            border: 0;
            border-radius: 6px;
            background: #4f46e5;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
        }

        .error {
            margin-top: 20px;
            padding: 12px;
            border-radius: 6px;
            background: #fee2e2;
            color: #991b1b;
        }

        .result {
            margin-top: 24px;
        }

        img {
            width: 100%;
            max-width: 520px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <h1>FashionAI Virtual Try-On</h1>

    <form method="post" enctype="multipart/form-data">
        <label>
            Person image
            <input type="file" name="person_image" accept="image/jpeg,image/png" required>
        </label>

        <label>
            Clothing image
            <input type="file" name="cloth_image" accept="image/jpeg,image/png" required>
        </label>

        <button type="submit">Generate Try-On</button>
    </form>

    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>

    <?php if ($result): ?>
        <div class="result">
            <h2><?= htmlspecialchars((string) $result['message'], ENT_QUOTES, 'UTF-8') ?></h2>
            <p>Request ID: <?= htmlspecialchars((string) $result['request_id'], ENT_QUOTES, 'UTF-8') ?></p>
            <p>Processing time: <?= htmlspecialchars((string) $result['processing_time'], ENT_QUOTES, 'UTF-8') ?></p>
            <img
                src="<?= htmlspecialchars((string) $result['generated_image'], ENT_QUOTES, 'UTF-8') ?>"
                alt="Generated virtual try-on image"
            >
        </div>
    <?php endif; ?>
</body>
</html>
