CREATE DATABASE IF NOT EXISTS fashionai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fashionai;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(120) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  location VARCHAR(160) DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_ref VARCHAR(80) NOT NULL,
  product_name VARCHAR(160) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_ref VARCHAR(80) NOT NULL,
  product_name VARCHAR(160) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_ref VARCHAR(80) NOT NULL,
  product_name VARCHAR(160) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  old_price DECIMAL(10,2) DEFAULT NULL,
  discount_label VARCHAR(40) DEFAULT '',
  image_path VARCHAR(255) DEFAULT '',
  rating_label VARCHAR(80) DEFAULT '',
  tags TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS virtual_tryons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  user_image_name VARCHAR(255) DEFAULT '',
  cloth_image_name VARCHAR(255) DEFAULT '',
  result_image_path VARCHAR(255) DEFAULT '',
  fit_score INT UNSIGNED DEFAULT NULL,
  style_score INT UNSIGNED DEFAULT NULL,
  color_score INT UNSIGNED DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tryons_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_assistant_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  user_message TEXT NOT NULL,
  bot_reply TEXT NOT NULL,
  matched_products TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_search_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  search_text VARCHAR(255) NOT NULL,
  result_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_search_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS support_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  name VARCHAR(120) DEFAULT '',
  email VARCHAR(160) DEFAULT '',
  subject VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_support_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);

INSERT INTO products (product_name, category, price, old_price, discount_label, image_path, rating_label, tags) VALUES
('Casual Cotton T-Shirt', 'men', 799, 999, '20% OFF', 'images/products/tshirt.jpg', '120 Reviews', 'casual cotton tshirt summer men'),
('Formal Office Shirt', 'men', 1199, 1399, '15% OFF', 'images/products/formal.jpg', '95 Reviews', 'formal office interview shirt men'),
('Floral Summer Dress', 'women', 1499, 2099, '30% OFF', 'images/products/floral.jpg', '160 Reviews', 'floral summer dress party women'),
('Blue Denim Baggii', 'women', 1099, 1499, '25% OFF', 'images/products/denimbaggii.jpg', '88 Reviews', 'denim jeans casual women'),
('Designer Kurti', 'women', 999, 1299, '18% OFF', 'images/products/designerkurti.jpg', '210 Reviews', 'kurti ethnic traditional women'),
('Oversized Hoodie', 'men', 1399, 2099, '35% OFF', 'images/products/hoodi.jpg', '175 Reviews', 'hoodie winter casual men'),
('Silk Saree', 'women', 2499, 3299, '28% OFF', 'images/products/silk.jpg', '260 Reviews', 'saree silk wedding traditional women'),
('Winter Jacket', 'men', 2199, 2799, '20% OFF', 'images/products/jacket.jpg', '110 Reviews', 'jacket winter men'),
('Sports Track Suit', 'men', 1699, 1999, '12% OFF', 'images/products/track.jpg', '180 Reviews', 'sports track suit active men'),
('Trendy Crop Top', 'women', 699, 899, '20% OFF', 'images/products/crop-top.jpg', '185 Reviews', 'crop top party casual women'),
('Short Printed Kurti', 'women', 899, 1099, '18% OFF', 'images/products/short-kurti.jpg', '145 Reviews', 'kurti printed casual women'),
('Puff Sleeves Top', 'women', 799, 999, '15% OFF', 'images/products/sleeves-top.jpg', '165 Reviews', 'top sleeves party women'),
('Banarasi Silk Saree', 'women', 2999, 3799, '20% OFF', 'images/products/banarasi-saree.jpg', '245 Reviews', 'banarasi silk saree wedding women'),
('Basic Tank Top', 'women', 599, 749, '20% OFF', 'images/products/tank-top.jpg', '145 Reviews', 'tank top summer casual women'),
('Lavender Co-Ord Set', 'women', 1499, 1999, '25% OFF', 'images/products/lavender-coord-set.jpg', '215 Reviews', 'lavender coord set party women'),
('Oversized Cotton Shirt', 'women', 999, 1299, '18% OFF', 'images/products/oversized-cotton-shirt.jpg', '172 Reviews', 'oversized cotton shirt casual women'),
('Party Wear Anarkali', 'women', 2199, 3099, '30% OFF', 'images/products/party-anarkali.jpg', '248 Reviews', 'party anarkali wedding ethnic women'),
('Chikankari Kurti', 'women', 1299, 1699, '20% OFF', 'images/products/chikankari-kurti.jpg', '286 Reviews', 'chikankari kurti traditional women'),
('Blue Denim Jacket', 'women', 1899, 2399, '20% OFF', 'images/products/denim-jacket.jpg', '215 Reviews', 'denim jacket winter casual women'),
('High Waist Denim Shorts', 'women', 999, 1299, '25% OFF', 'images/products/high-waist-denim-shorts.jpg', '198 Reviews', 'denim shorts summer casual women'),
('Slim Fit Jeans', 'men', 1499, 1899, '21% OFF', 'images/products/slim-fit-jeans.jpg', '192 Reviews', 'slim fit jeans denim men')
ON DUPLICATE KEY UPDATE product_name = product_name;
