<?php
require_once __DIR__ . '/../config.php';

try {
    $data = input();
    require_fields($data, ['subject', 'message']);

    db()->prepare(
        'INSERT INTO support_requests (user_id, name, email, subject, message)
         VALUES (:user_id, :name, :email, :subject, :message)'
    )->execute([
        ':user_id' => (int) ($data['user_id'] ?? 0) ?: null,
        ':name' => trim((string) ($data['name'] ?? '')),
        ':email' => strtolower(trim((string) ($data['email'] ?? ''))),
        ':subject' => trim($data['subject']),
        ':message' => trim($data['message']),
    ]);

    json_response(['success' => true, 'message' => 'Support request saved.', 'support_id' => (int) db()->lastInsertId()], 201);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
