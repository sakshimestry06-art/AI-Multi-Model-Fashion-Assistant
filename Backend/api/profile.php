<?php
require_once __DIR__ . '/../config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $userId = (int) ($_GET['user_id'] ?? 0);

        if ($userId <= 0) {
            json_response(['success' => false, 'message' => 'Missing user_id.'], 422);
        }

        $stmt = db()->prepare('SELECT name, email, phone, location FROM profiles WHERE user_id = :user_id LIMIT 1');
        $stmt->execute([':user_id' => $userId]);
        $profile = $stmt->fetch();

        json_response(['success' => true, 'profile' => $profile ?: null]);
    }

    $data = input();
    require_fields($data, ['user_id', 'name', 'email', 'phone']);

    db()->prepare(
        'INSERT INTO profiles (user_id, name, email, phone, location)
         VALUES (:user_id, :name, :email, :phone, :location)
         ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            location = VALUES(location)'
    )->execute([
        ':user_id' => (int) $data['user_id'],
        ':name' => trim($data['name']),
        ':email' => strtolower(trim($data['email'])),
        ':phone' => trim($data['phone']),
        ':location' => trim((string) ($data['location'] ?? '')),
    ]);

    json_response(['success' => true, 'message' => 'Profile saved.']);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
