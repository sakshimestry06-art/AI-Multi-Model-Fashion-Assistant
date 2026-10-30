<?php
require_once __DIR__ . '/../config.php';

try {
    $search = strtolower(trim((string) ($_GET['search'] ?? '')));
    $category = strtolower(trim((string) ($_GET['category'] ?? '')));

    $sql = 'SELECT id, product_name AS name, category, price, old_price, discount_label, image_path, rating_label, tags
            FROM products WHERE is_active = 1';
    $params = [];

    if ($search !== '') {
        $sql .= ' AND (LOWER(product_name) LIKE :search OR LOWER(category) LIKE :search OR LOWER(tags) LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    if ($category !== '') {
        $sql .= ' AND category = :category';
        $params[':category'] = $category;
    }

    $sql .= ' ORDER BY id ASC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    if ($search !== '') {
        $userId = (int) ($_GET['user_id'] ?? 0);
        db()->prepare(
            'INSERT INTO product_search_logs (user_id, search_text, result_count)
             VALUES (:user_id, :search_text, :result_count)'
        )->execute([
            ':user_id' => $userId > 0 ? $userId : null,
            ':search_text' => $search,
            ':result_count' => count($products),
        ]);
    }

    json_response(['success' => true, 'products' => $products]);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
