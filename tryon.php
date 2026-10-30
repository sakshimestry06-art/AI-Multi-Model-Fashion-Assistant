<?php
require_once __DIR__ . '/../config.php';

try {
    $data = input();

    db()->prepare(
        'INSERT INTO virtual_tryons
            (user_id, user_image_name, cloth_image_name, result_image_path, fit_score, style_score, color_score, notes)
         VALUES
            (:user_id, :user_image_name, :cloth_image_name, :result_image_path, :fit_score, :style_score, :color_score, :notes)'
    )->execute([
        ':user_id' => (int) ($data['user_id'] ?? 0) ?: null,
        ':user_image_name' => (string) ($data['user_image_name'] ?? ''),
        ':cloth_image_name' => (string) ($data['cloth_image_name'] ?? ''),
        ':result_image_path' => (string) ($data['result_image_path'] ?? 'images/ai-result.png'),
        ':fit_score' => (int) ($data['fit_score'] ?? 92),
        ':style_score' => (int) ($data['style_score'] ?? 88),
        ':color_score' => (int) ($data['color_score'] ?? 90),
        ':notes' => (string) ($data['notes'] ?? 'Demo virtual try-on generated.'),
    ]);

    json_response(['success' => true, 'message' => 'Virtual try-on saved.', 'tryon_id' => (int) db()->lastInsertId()], 201);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
