<?php
require_once __DIR__ . '/../config.php';

try {
    $data = input();
    require_fields($data, ['fullname', 'username', 'email', 'phone', 'gender', 'dob', 'password']);

    $stmt = db()->prepare(
        'INSERT INTO users (fullname, username, email, phone, gender, dob, password_hash)
         VALUES (:fullname, :username, :email, :phone, :gender, :dob, :password_hash)'
    );

    $stmt->execute([
        ':fullname' => trim($data['fullname']),
        ':username' => trim($data['username']),
        ':email' => strtolower(trim($data['email'])),
        ':phone' => trim($data['phone']),
        ':gender' => trim($data['gender']),
        ':dob' => trim($data['dob']),
        ':password_hash' => password_hash((string) $data['password'], PASSWORD_DEFAULT),
    ]);

    $userId = (int) db()->lastInsertId();

    db()->prepare(
        'INSERT INTO profiles (user_id, name, email, phone, location)
         VALUES (:user_id, :name, :email, :phone, :location)'
    )->execute([
        ':user_id' => $userId,
        ':name' => trim($data['fullname']),
        ':email' => strtolower(trim($data['email'])),
        ':phone' => trim($data['phone']),
        ':location' => '',
    ]);

    json_response([
        'success' => true,
        'message' => 'Registration successful.',
        'user' => [
            'id' => $userId,
            'fullname' => trim($data['fullname']),
            'username' => trim($data['username']),
            'email' => strtolower(trim($data['email'])),
            'phone' => trim($data['phone']),
        ],
    ], 201);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        json_response(['success' => false, 'message' => 'Email or username already registered.'], 409);
    }

    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
