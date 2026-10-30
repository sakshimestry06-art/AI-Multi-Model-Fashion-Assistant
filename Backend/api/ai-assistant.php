<?php
require_once __DIR__ . '/../config.php';

function normalize_text(string $text): string
{
    $text = strtolower(trim(preg_replace('/\s+/', ' ', $text)));
    $replacements = [
        'weeding' => 'wedding',
        'weding' => 'wedding',
        'weddng' => 'wedding',
        'wedng' => 'wedding',
        'mi ' => 'my ',
        'outift' => 'outfit',
        'outfir' => 'outfit',
        'sare' => 'saree',
        'sari' => 'saree',
        'kurthi' => 'kurti',
    ];

    return str_replace(array_keys($replacements), array_values($replacements), $text);
}

function contains_any(string $text, array $needles): bool
{
    foreach ($needles as $needle) {
        if (str_contains($text, $needle)) {
            return true;
        }
    }

    return false;
}

function detect_intent(string $message): string
{
    if (contains_any($message, ['support', 'help', 'problem', 'issue', 'contact', 'refund', 'return'])) {
        return 'support';
    }

    if (contains_any($message, ['try on', 'try-on', 'virtual']) || preg_match('/\b(fit|size|fitting)\b/', $message)) {
        return 'tryon';
    }

    if (contains_any($message, ['cart', 'checkout', 'buy', 'order'])) {
        return 'shopping';
    }

    if (contains_any($message, ['match', 'pair', 'style', 'outfit', 'wear', 'recommend', 'suggest', 'show', 'find', 'best'])) {
        return 'recommendation';
    }

    if (contains_any($message, ['hello', 'hi', 'hey'])) {
        return 'greeting';
    }

    return 'recommendation';
}

function context_terms(string $message): array
{
    $map = [
        'wedding' => ['wedding', 'saree', 'banarasi', 'silk', 'anarkali', 'traditional', 'ethnic'],
        'party' => ['party', 'crop', 'dress', 'coord', 'anarkali', 'top'],
        'interview' => ['interview', 'office', 'formal', 'shirt'],
        'office' => ['office', 'formal', 'shirt', 'cotton'],
        'summer' => ['summer', 'cotton', 'tank', 'dress', 'shorts', 'top'],
        'winter' => ['winter', 'hoodie', 'jacket', 'denim'],
        'rainy' => ['jacket', 'denim', 'track', 'cotton'],
        'kurti' => ['kurti', 'chikankari', 'printed', 'traditional'],
        'saree' => ['saree', 'silk', 'banarasi', 'wedding'],
        'jeans' => ['jeans', 'denim', 'shirt', 'jacket'],
        'hoodie' => ['hoodie', 'winter', 'casual'],
        'jacket' => ['jacket', 'winter', 'denim'],
        'men' => ['men'],
        'women' => ['women'],
        'budget' => ['budget', 'cheap', 'affordable', 'low price'],
        'premium' => ['premium', 'silk', 'banarasi', 'jacket', 'anarkali'],
    ];

    $terms = [];

    foreach ($map as $trigger => $values) {
        if (str_contains($message, $trigger)) {
            $terms = array_merge($terms, $values);
        }
    }

    $words = preg_split('/[^a-z0-9]+/i', $message);

    foreach ($words as $word) {
        if (strlen($word) >= 4 && !in_array($word, ['what', 'with', 'this', 'that', 'should', 'please', 'want'], true)) {
            $terms[] = $word;
        }
    }

    return array_values(array_unique($terms));
}

function requested_budget(string $message): ?float
{
    if (preg_match('/(?:under|below|less than|budget|upto|up to)\s*(?:rs\.?|₹)?\s*([0-9,]+)/i', $message, $match)) {
        return (float) str_replace(',', '', $match[1]);
    }

    return null;
}

function find_products(string $message): array
{
    $terms = context_terms($message);
    $budget = requested_budget($message);
    $params = [];
    $scoreParts = [];

    foreach (array_slice($terms, 0, 12) as $index => $term) {
        $key = ':term' . $index;
        $scoreParts[] = "CASE WHEN LOWER(CONCAT(product_name, ' ', category, ' ', COALESCE(tags, ''))) LIKE $key THEN 1 ELSE 0 END";
        $params[$key] = '%' . strtolower($term) . '%';
    }

    $score = $scoreParts ? implode(' + ', $scoreParts) : '0';
    $sql = "SELECT id, product_name, category, price, old_price, discount_label, image_path, rating_label, tags,
                   ($score) AS match_score
            FROM products
            WHERE is_active = 1";

    if ($budget !== null) {
        $sql .= ' AND price <= :budget';
        $params[':budget'] = $budget;
    }

    $sql .= ' ORDER BY match_score DESC, price ASC LIMIT 6';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    if (!$products || (int) ($products[0]['match_score'] ?? 0) === 0) {
        $fallback = db()->prepare(
            'SELECT id, product_name, category, price, old_price, discount_label, image_path, rating_label, tags, 0 AS match_score
             FROM products
             WHERE is_active = 1 ' . ($budget !== null ? 'AND price <= :budget ' : '') . '
             ORDER BY price ASC
             LIMIT 6'
        );

        $fallback->execute($budget !== null ? [':budget' => $budget] : []);
        $products = $fallback->fetchAll();
    }

    return $products;
}

function rupees($price): string
{
    return 'Rs. ' . number_format((float) $price, 0);
}

function build_answer(string $intent, string $message, array $products): array
{
    $top = $products[0] ?? null;
    $summary = '';
    $tips = [];
    $actions = [];

    if ($intent === 'greeting') {
        $summary = 'Hi, I am ready. Ask for an occasion, weather, color, budget, gender, or product type and I will recommend matching FashionAI products.';
        $tips = ['Try: "wedding saree under 3000"', 'Try: "office outfit for men"', 'Try: "party outfit with crop top"'];
        return compact('summary', 'tips', 'actions');
    }

    if ($intent === 'support') {
        $summary = 'I can help with login, registration, cart, wishlist, orders, product selection, and virtual try-on. Tell me the exact issue and I will guide you step by step.';
        $tips = ['For product help, mention the item name or occasion.', 'For order help, mention checkout, cart, or payment.', 'For account help, mention login or registration.'];
        $actions = [['label' => 'Open Products', 'href' => 'products.html'], ['label' => 'Open Cart', 'href' => 'cart.html']];
        return compact('summary', 'tips', 'actions');
    }

    if ($intent === 'tryon') {
        $summary = 'Use Virtual Try-On when you want to compare fit and visual styling before buying. Pick one product from the recommendations, upload your photo, then upload the clothing image.';
        $tips = ['Use a clear front-facing photo.', 'Choose bright lighting.', 'Try fitted and loose styles separately for better comparison.'];
        $actions = [['label' => 'Open Virtual Try-On', 'href' => 'virtual-tryon.html']];
    } elseif ($top) {
        $summary = 'My strongest pick is ' . $top['product_name'] . ' at ' . rupees($top['price']) . '. It best matches your request and can be styled easily with items already in the FashionAI catalog.';
    } else {
        $summary = 'I could not find an exact product match, but I can still help if you mention occasion, budget, gender, color, or item name.';
    }

    if (contains_any($message, ['wedding', 'saree', 'traditional', 'ethnic'])) {
        $tips[] = 'For weddings, choose richer fabrics like silk or Banarasi and keep accessories elegant.';
        $tips[] = 'Pair sarees or anarkali styles with metallic heels and a compact clutch.';
    }

    if (contains_any($message, ['office', 'interview', 'formal'])) {
        $tips[] = 'For interviews, prefer clean lines, neutral colors, and one polished statement piece.';
        $tips[] = 'Avoid loud prints; a formal shirt with dark trousers is the safest choice.';
    }

    if (contains_any($message, ['summer', 'hot'])) {
        $tips[] = 'For summer, prioritize cotton, tank tops, light dresses, and breathable fits.';
    }

    if (contains_any($message, ['winter', 'cold'])) {
        $tips[] = 'For winter, use a jacket or hoodie as the top layer and balance it with denim.';
    }

    if (contains_any($message, ['budget', 'under', 'below', 'cheap', 'affordable'])) {
        $tips[] = 'I sorted toward lower prices while keeping the match relevant.';
    }

    if (!$tips) {
        $tips[] = 'Tell me your occasion, preferred color, size, and budget for a sharper recommendation.';
        $tips[] = 'You can ask me to compare two products or build a full outfit.';
    }

    $actions[] = ['label' => 'View Products', 'href' => 'products.html'];
    $actions[] = ['label' => 'Try It On', 'href' => 'virtual-tryon.html'];

    return compact('summary', 'tips', 'actions');
}

try {
    $data = input();
    require_fields($data, ['message']);

    $message = normalize_text($data['message']);
    $intent = detect_intent($message);
    $products = in_array($intent, ['recommendation', 'shopping', 'tryon'], true) ? find_products($message) : [];
    $answer = build_answer($intent, $message, $products);

    $productCards = array_map(fn($product) => [
        'id' => (int) $product['id'],
        'name' => $product['product_name'],
        'category' => $product['category'],
        'price' => (float) $product['price'],
        'old_price' => $product['old_price'] !== null ? (float) $product['old_price'] : null,
        'discount_label' => $product['discount_label'],
        'image_path' => $product['image_path'],
        'rating_label' => $product['rating_label'],
    ], $products);

    db()->prepare(
        'INSERT INTO ai_assistant_logs (user_id, user_message, bot_reply, matched_products)
         VALUES (:user_id, :user_message, :bot_reply, :matched_products)'
    )->execute([
        ':user_id' => (int) ($data['user_id'] ?? 0) ?: null,
        ':user_message' => $message,
        ':bot_reply' => $answer['summary'] . ' ' . implode(' ', $answer['tips']),
        ':matched_products' => json_encode(array_column($productCards, 'name')),
    ]);

    json_response([
        'success' => true,
        'intent' => $intent,
        'reply' => $answer['summary'],
        'tips' => $answer['tips'],
        'actions' => $answer['actions'],
        'products' => $productCards,
    ]);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
}
