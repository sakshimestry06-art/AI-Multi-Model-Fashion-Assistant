<?php
require_once __DIR__ . '/../config.php';

try {
    $data = input();
    require_fields($data, ['user_id', 'items', 'total']);

    $items = is_array($data['items']) ? $data['items'] : [];

    if (count($items) === 0) {
        json_response(['success' => false, 'message' => 'Order has no items.'], 422);
    }

    $pdo = db();
    $pdo->beginTransaction();

    $pdo->prepare(
        'INSERT INTO orders (user_id, subtotal, discount, delivery, total, payment_method, status)
         VALUES (:user_id, :subtotal, :discount, :delivery, :total, :payment_method, :status)'
    )->execute([
        ':user_id' => (int) $data['user_id'],
        ':subtotal' => (float) ($data['subtotal'] ?? $data['total']),
        ':discount' => (float) ($data['discount'] ?? 0),
        ':delivery' => (float) ($data['delivery'] ?? 0),
        ':total' => (float) $data['total'],
        ':payment_method' => (string) ($data['payment_method'] ?? 'UPI Payment'),
        ':status' => 'Placed',
    ]);

    $orderId = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare(
        'INSERT INTO order_items (order_id, product_ref, product_name, price, quantity)
         VALUES (:order_id, :product_ref, :product_name, :price, :quantity)'
    );

    foreach ($items as $item) {
        $stmt->execute([
            ':order_id' => $orderId,
            ':product_ref' => (string) ($item['id'] ?? ''),
            ':product_name' => (string) ($item['name'] ?? 'Product'),
            ':price' => (float) ($item['price'] ?? 0),
            ':quantity' => max(1, (int) ($item['quantity'] ?? 1)),
        ]);
    }

    $pdo->prepare('DELETE FROM cart_items WHERE user_id = :user_id')->execute([':user_id' => (int) $data['user_id']]);
    $pdo->commit();

    json_response(['success' => true, 'message' => 'Order saved.', 'order_id' => $orderId], 201);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
