<?php
require_once __DIR__ . '/../config.php';

try {
    $data = input();
    require_fields($data, ['email', 'password']);

    $stmt = db()->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => strtolower(trim($data['email']))]);
    $user = $stmt->fetch();

    if (!$user || !password_verify((string) $data['password'], $user['password_hash'])) {
        json_response(['success' => false, 'message' => 'Invalid email or password.'], 401);
    }

    json_response([
        'success' => true,
        'message' => 'Login successful.',
        'user' => [
            'id' => (int) $user['id'],
            'fullname' => $user['fullname'],
            'username' => $user['username'],
            'email' => $user['email'],
            'phone' => $user['phone'],
        ],
    ]);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
