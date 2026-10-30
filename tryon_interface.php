<?php
declare(strict_types=1);

$currentProductId = isset($product_id)
    ? (int) $product_id
    : (int) ($_GET['product_id'] ?? $_GET['id'] ?? 0);

$currentTryonCategory = isset($tryon_category)
    ? (string) $tryon_category
    : (string) ($_GET['category'] ?? 'Upper-body');

$allowedTryonCategories = ['Upper-body', 'Lower-body', 'Dress'];
if (!in_array($currentTryonCategory, $allowedTryonCategories, true)) {
    $currentTryonCategory = 'Upper-body';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Virtual Try-On</title>
    <style>
        :root {
            --tryon-bg: #f7f8fb;
            --tryon-panel: #ffffff;
            --tryon-text: #172033;
            --tryon-muted: #687386;
            --tryon-primary: #6d5dfc;
            --tryon-primary-dark: #5546dd;
            --tryon-border: #dde3ee;
            --tryon-error-bg: #fff1f2;
            --tryon-error-text: #b4233a;
            --tryon-error-border: #fecdd3;
        }

        .tryon-widget {
            max-width: 760px;
            margin: 32px auto;
            padding: 24px;
            background: var(--tryon-panel);
            border: 1px solid var(--tryon-border);
            border-radius: 8px;
            box-shadow: 0 18px 48px rgba(23, 32, 51, 0.09);
            color: var(--tryon-text);
            font-family: Arial, sans-serif;
        }

        .tryon-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 20px;
        }

        .tryon-title {
            margin: 0 0 6px;
            font-size: 24px;
            line-height: 1.2;
        }

        .tryon-subtitle {
            margin: 0;
            color: var(--tryon-muted);
            font-size: 14px;
            line-height: 1.5;
        }

        .tryon-product-id {
            flex: 0 0 auto;
            padding: 8px 10px;
            border: 1px solid var(--tryon-border);
            border-radius: 8px;
            background: var(--tryon-bg);
            color: var(--tryon-muted);
            font-size: 13px;
            font-weight: 700;
        }

        .tryon-form {
            display: grid;
            gap: 14px;
        }

        .tryon-label {
            display: block;
            font-size: 14px;
            font-weight: 700;
        }

        .tryon-input {
            width: 100%;
            box-sizing: border-box;
            margin-top: 8px;
            padding: 13px;
            border: 1px dashed #b8c2d4;
            border-radius: 8px;
            background: #fbfcff;
            color: var(--tryon-text);
        }

        .tryon-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .tryon-button {
            min-width: 128px;
            border: 0;
            border-radius: 8px;
            padding: 12px 18px;
            background: var(--tryon-primary);
            color: #ffffff;
            font-size: 15px;
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.15s ease, background 0.15s ease, opacity 0.15s ease;
        }

        .tryon-button:hover {
            background: var(--tryon-primary-dark);
            transform: translateY(-1px);
        }

        .tryon-button:disabled {
            cursor: not-allowed;
            opacity: 0.62;
            transform: none;
        }

        .tryon-loading {
            display: none;
            align-items: center;
            gap: 10px;
            color: var(--tryon-muted);
            font-size: 14px;
            font-weight: 700;
        }

        .tryon-spinner {
            width: 18px;
            height: 18px;
            border: 3px solid #d9def0;
            border-top-color: var(--tryon-primary);
            border-radius: 50%;
            animation: tryon-spin 0.8s linear infinite;
        }

        @keyframes tryon-spin {
            to {
                transform: rotate(360deg);
            }
        }

        .tryon-error {
            display: none;
            padding: 12px 14px;
            border: 1px solid var(--tryon-error-border);
            border-radius: 8px;
            background: var(--tryon-error-bg);
            color: var(--tryon-error-text);
            font-size: 14px;
            font-weight: 700;
        }

        .tryon-result {
            display: none;
            margin-top: 18px;
            padding: 14px;
            border: 1px solid var(--tryon-border);
            border-radius: 8px;
            background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
        }

        .tryon-result-title {
            margin: 0 0 12px;
            font-size: 16px;
            font-weight: 800;
        }

        .tryon-result-image {
            display: block;
            width: 100%;
            max-height: 620px;
            object-fit: contain;
            border-radius: 8px;
            background: #eef2f8;
        }

        @media (max-width: 560px) {
            .tryon-widget {
                margin: 18px 12px;
                padding: 18px;
            }

            .tryon-header {
                display: grid;
            }

            .tryon-product-id {
                width: fit-content;
            }
        }
    </style>
</head>
<body>
    <section
        class="tryon-widget"
        data-product-id="<?php echo htmlspecialchars((string) $currentProductId, ENT_QUOTES, 'UTF-8'); ?>"
        data-category="<?php echo htmlspecialchars($currentTryonCategory, ENT_QUOTES, 'UTF-8'); ?>"
    >
        <div class="tryon-header">
            <div>
                <h2 class="tryon-title">Virtual Try-On</h2>
                <p class="tryon-subtitle">Upload a clear front-facing JPG or PNG photo under 2 MB.</p>
            </div>
            <div class="tryon-product-id">
                Product ID:
                <span id="tryonProductId"><?php echo htmlspecialchars((string) $currentProductId, ENT_QUOTES, 'UTF-8'); ?></span>
                <br>
                Category:
                <span id="tryonCategory"><?php echo htmlspecialchars($currentTryonCategory, ENT_QUOTES, 'UTF-8'); ?></span>
            </div>
        </div>

        <form id="tryonForm" class="tryon-form" enctype="multipart/form-data">
            <label class="tryon-label" for="userPhoto">
                Your photo
                <input
                    class="tryon-input"
                    type="file"
                    id="userPhoto"
                    name="user_photo"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    required
                >
            </label>

            <div id="tryonError" class="tryon-error" role="alert"></div>

            <div class="tryon-actions">
                <button type="submit" id="tryonButton" class="tryon-button">Try On</button>
                <div id="tryonLoading" class="tryon-loading" aria-live="polite">
                    <span class="tryon-spinner" aria-hidden="true"></span>
                    <span>AI is dressing you up... Please wait 15-30 seconds.</span>
                </div>
            </div>
        </form>

        <div id="tryonResult" class="tryon-result">
            <p class="tryon-result-title">Your AI try-on result</p>
            <img id="resultImage" class="tryon-result-image" src="" alt="AI generated virtual try-on result">
        </div>
    </section>

    <script>
        (function () {
            const MAX_CLIENT_IMAGE_SIZE = 2 * 1024 * 1024;
            const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

            const widget = document.querySelector('.tryon-widget');
            const form = document.getElementById('tryonForm');
            const fileInput = document.getElementById('userPhoto');
            const button = document.getElementById('tryonButton');
            const loading = document.getElementById('tryonLoading');
            const errorBox = document.getElementById('tryonError');
            const resultBox = document.getElementById('tryonResult');
            const resultImage = document.getElementById('resultImage');

            function showError(message) {
                errorBox.textContent = message;
                errorBox.style.display = 'block';
            }

            function clearError() {
                errorBox.textContent = '';
                errorBox.style.display = 'none';
            }

            function setBusy(isBusy) {
                button.disabled = isBusy;
                loading.style.display = isBusy ? 'flex' : 'none';
            }

            function getProductId() {
                return widget ? Number(widget.dataset.productId || 0) : 0;
            }

            function getCategory() {
                return widget ? String(widget.dataset.category || '') : '';
            }

            function validatePhoto(file) {
                if (!file) {
                    return 'Please choose a photo before starting try-on.';
                }

                if (!ALLOWED_TYPES.includes(file.type)) {
                    return 'Only JPG, JPEG, and PNG image files are allowed.';
                }

                if (file.size > MAX_CLIENT_IMAGE_SIZE) {
                    return 'This photo is larger than 2 MB. Please upload a smaller image to protect local RAM.';
                }

                return '';
            }

            fileInput.addEventListener('change', function () {
                clearError();

                const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
                const validationMessage = validatePhoto(file);

                if (validationMessage && file) {
                    alert(validationMessage);
                    fileInput.value = '';
                }
            });

            form.addEventListener('submit', async function (event) {
                event.preventDefault();
                clearError();
                resultBox.style.display = 'none';
                resultImage.removeAttribute('src');

                const productId = getProductId();
                const category = getCategory();
                if (!productId) {
                    showError('Product ID is missing. Please open this from a valid product page.');
                    return;
                }

                if (!['Upper-body', 'Lower-body', 'Dress'].includes(category)) {
                    showError('Product try-on category is missing or invalid.');
                    return;
                }

                const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
                const validationMessage = validatePhoto(file);
                if (validationMessage) {
                    showError(validationMessage);
                    return;
                }

                const formData = new FormData();
                formData.append('user_photo', file);
                formData.append('product_id', String(productId));
                formData.append('category', category);

                setBusy(true);

                try {
                    const response = await fetch('tryon_process.php', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json().catch(function () {
                        throw new Error('The server returned an unreadable response.');
                    });

                    if (!response.ok || data.status !== 'success') {
                        throw new Error(data.message || 'Virtual try-on failed. Please try again.');
                    }

                    resultImage.src = data.image_url;
                    resultBox.style.display = 'block';
                } catch (error) {
                    showError(error.message || 'Something went wrong while generating your try-on.');
                } finally {
                    setBusy(false);
                }
            });
        })();
    </script>
</body>
</html>
