<?php
require_once __DIR__ . '/../config.php';

try {
    $data = input();
    require_fields($data, ['user_id', 'type']);

    $type = $data['type'];
    $table = $type === 'cart' ? 'cart_items' : ($type === 'wishlist' ? 'wishlist_items' : '');

    if ($table === '') {
        json_response(['success' => false, 'message' => 'Type must be cart or wishlist.'], 422);
    }

    $items = is_array($data['items'] ?? null) ? $data['items'] : [];
    $pdo = db();
    $pdo->beginTransaction();

    $pdo->prepare("DELETE FROM $table WHERE user_id = :user_id")->execute([':user_id' => (int) $data['user_id']]);

    $stmt = $pdo->prepare(
        "INSERT INTO $table (user_id, product_ref, product_name, price, quantity)
         VALUES (:user_id, :product_ref, :product_name, :price, :quantity)"
    );

    foreach ($items as $item) {
        $stmt->execute([
            ':user_id' => (int) $data['user_id'],
            ':product_ref' => (string) ($item['id'] ?? ''),
            ':product_name' => (string) ($item['name'] ?? 'Product'),
            ':price' => (float) ($item['price'] ?? 0),
            ':quantity' => max(1, (int) ($item['quantity'] ?? 1)),
        ]);
    }

    $pdo->commit();
    json_response(['success' => true, 'message' => ucfirst($type) . ' saved.']);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
