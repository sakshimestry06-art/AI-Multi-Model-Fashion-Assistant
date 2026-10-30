# FashionAI XAMPP Database Setup

1. Open XAMPP Control Panel.
2. Start `Apache` and `MySQL`.
3. Open phpMyAdmin in the browser:
   `http://localhost:8080/phpmyadmin`
4. Import the SQL file:
   `database/fashionai.sql`
5. Make sure the project is served by Apache, for example:
   `C:\xampp\htdocs\AI Multi-Model Fashion Assistant`
6. Open the app through Apache:
   `http://localhost:8080/AI%20Multi-Model%20Fashion%20Assistant/Frontend/index.html`

The PHP database config is in:
`Backend/config.php`

Default XAMPP credentials are already configured:

```php
DB_HOST = 127.0.0.1
DB_PORT = 3308
DB_NAME = fashionai
DB_USER = root
DB_PASS = ''
```

Tables created:

- `users`
- `profiles`
- `cart_items`
- `wishlist_items`
- `orders`
- `order_items`
- `products`
- `virtual_tryons`
- `ai_assistant_logs`
- `product_search_logs`
- `support_requests`

Important: PHP files will not run correctly through the Vite dev server. Use the Apache URL above when testing database save/login/register behavior.

Your XAMPP screenshot shows Apache on port `8080` and MySQL on port `3308`, so the project is configured for those ports.

## Realistic AI Virtual Try-On

The realistic try-on endpoint is:
`Backend/api/tryon-generate.php`

It sends the uploaded person image and outfit image to the OpenAI image edit API and saves the generated result path in `virtual_tryons`.

Set your API key in one of these ways:

1. Windows environment variable:
   `OPENAI_API_KEY`
2. Or create this local file:
   `Backend/.openai_key`

Do not commit or share the real key. Use `Backend/.openai_key.example` as the template.

If the key is missing, the page will show a browser preview fallback, but true realistic clothing replacement requires the API key.
