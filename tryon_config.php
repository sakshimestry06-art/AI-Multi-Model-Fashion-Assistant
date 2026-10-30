<?php
declare(strict_types=1);

// Keep this true while developing/demoing locally to avoid using Colab GPU quota.
$development_mode = true;

// Replace this with your current Google Colab Gradio public URL.
$colab_url = "https://gradio.live";

// Local demo image returned when development mode is enabled.
$demo_output_path = "uploads/demo_output.jpg";

// OOTDiffusion Gradio endpoint settings.
$gradio_fn_index = 1;
$gradio_timeout_seconds = 180;

