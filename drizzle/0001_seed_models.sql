-- === Seed models from db/seed_models.sql ===

-- Seed common Freepik endpoints under three categories (image, edit, video)
-- Adjust/extend as needed.

INSERT INTO models (name, kind, operation, request_style, request_endpoint, status_endpoint_template, is_async, supports_webhook, params_schema)
VALUES
  -- Image generation
  ('mystic', 'image', 'text_to_image', 'json', '/v1/ai/mystic', '/v1/ai/mystic/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"},"aspect_ratio":{"type":"string"},"seed":{"type":"integer"},"guidance_scale":{"type":"number"}},"required":["prompt"]}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Image editing
INSERT INTO models (name, kind, operation, request_style, request_endpoint, status_endpoint_template, is_async, supports_webhook, params_schema)
VALUES
  ('image-upscaler', 'edit', 'upscaler', 'json', '/v1/ai/image-upscaler', '/v1/ai/image-upscaler/{task-id}', true, true,
    '{"type":"object","properties":{"image_url":{"type":"string","format":"uri"},"scale":{"type":"number"}},"required":["image_url"]}'::jsonb
  ),
  ('image-upscaler-precision', 'edit', 'upscaler', 'json', '/v1/ai/image-upscaler-precision', '/v1/ai/image-upscaler-precision/{task-id}', true, true,
    '{"type":"object","properties":{"image_url":{"type":"string","format":"uri"},"target_resolution":{"type":"string"}},"required":["image_url"]}'::jsonb
  ),
  ('image-relight',  'edit', 'relight',  'json', '/v1/ai/image-relight',  '/v1/ai/image-relight/{task-id}',  true, true,
    '{"type":"object","properties":{"image_url":{"type":"string","format":"uri"},"prompt":{"type":"string"}},"required":["image_url"]}'::jsonb
  ),
  ('image-expand',   'edit', 'expand',   'json', '/v1/ai/image-expand/flux-pro', '/v1/ai/image-expand/flux-pro/{task-id}', true, true,
    '{"type":"object","properties":{"image_url":{"type":"string","format":"uri"},"width":{"type":"integer"},"height":{"type":"integer"}},"required":["image_url"]}'::jsonb
  ),
  ('image-style-transfer', 'edit', 'style_transfer', 'json', '/v1/ai/image-style-transfer', '/v1/ai/image-style-transfer/{task-id}', true, true,
    '{"type":"object","properties":{"image_url":{"type":"string","format":"uri"},"style":{"type":"string"}},"required":["image_url","style"]}'::jsonb
  ),
  ('remove-background-beta', 'edit', 'remove_background', 'form', '/v1/ai/beta/remove-background', NULL, false, false,
    '{"type":"object","properties":{"image_url":{"type":"string","format":"uri"}},"required":["image_url"]}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Video generation
INSERT INTO models (name, kind, operation, request_style, request_endpoint, status_endpoint_template, is_async, supports_webhook, params_schema)
VALUES
  ('image-to-video-minimax', 'video', 'image_to_video', 'json', '/v1/ai/image-to-video/minimax', '/v1/ai/image-to-video/minimax/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"},"first_frame_image":{"type":"string","format":"uri"},"duration":{"type":"integer"}},"required":["prompt"]}'::jsonb
  ),
  ('image-to-video-wan-480p','video','image_to_video','json','/v1/ai/image-to-video/wan-v2-2-480p','/v1/ai/image-to-video/wan-v2-2-480p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"},"first_frame_image":{"type":"string","format":"uri"},"duration":{"type":"integer"}},"required":["prompt"]}'::jsonb
  ),
  ('image-to-video-wan-580p','video','image_to_video','json','/v1/ai/image-to-video/wan-v2-2-580p','/v1/ai/image-to-video/wan-v2-2-580p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"},"first_frame_image":{"type":"string","format":"uri"},"duration":{"type":"integer"}},"required":["prompt"]}'::jsonb
  ),
  ('image-to-video-wan-720p','video','image_to_video','json','/v1/ai/image-to-video/wan-v2-2-720p','/v1/ai/image-to-video/wan-v2-2-720p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"},"first_frame_image":{"type":"string","format":"uri"},"duration":{"type":"integer"}},"required":["prompt"]}'::jsonb
  ),
  ('image-to-video-seedance-lite-1080p','video','image_to_video','json','/v1/ai/image-to-video/seedance-lite-1080p','/v1/ai/image-to-video/seedance-lite-1080p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-seedance-lite-480p','video','image_to_video','json','/v1/ai/image-to-video/seedance-lite-480p','/v1/ai/image-to-video/seedance-lite-480p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-seedance-lite-720p','video','image_to_video','json','/v1/ai/image-to-video/seedance-lite-720p','/v1/ai/image-to-video/seedance-lite-720p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-seedance-pro-480p','video','image_to_video','json','/v1/ai/image-to-video/seedance-pro-480p','/v1/ai/image-to-video/seedance-pro-480p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-seedance-pro-720p','video','image_to_video','json','/v1/ai/image-to-video/seedance-pro-720p','/v1/ai/image-to-video/seedance-pro-720p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-seedance-pro-1080p','video','image_to_video','json','/v1/ai/image-to-video/seedance-pro-1080p','/v1/ai/image-to-video/seedance-pro-1080p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-minimax-hailuo-02-1080p','video','image_to_video','json','/v1/ai/image-to-video/minimax-hailuo-02-1080p','/v1/ai/image-to-video/minimax-hailuo-02-1080p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"},"first_frame_image":{"type":"string","format":"uri"},"duration":{"type":"integer"}}}'::jsonb
  ),
  ('image-to-video-minimax-hailuo-02-768p','video','image_to_video','json','/v1/ai/image-to-video/minimax-hailuo-02-768p','/v1/ai/image-to-video/minimax-hailuo-02-768p/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-elements-pro','video','image_to_video','json','/v1/ai/image-to-video/kling-elements-pro','/v1/ai/image-to-video/kling-elements/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-elements-std','video','image_to_video','json','/v1/ai/image-to-video/kling-elements-std','/v1/ai/image-to-video/kling-elements/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-v2-1-master','video','image_to_video','json','/v1/ai/image-to-video/kling-v2-1-master','/v1/ai/image-to-video/kling-v2-1-master/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-v2-1-pro','video','image_to_video','json','/v1/ai/image-to-video/kling-v2-1-pro','/v1/ai/image-to-video/kling-v2-1/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-v2-1-std','video','image_to_video','json','/v1/ai/image-to-video/kling-v2-1-std','/v1/ai/image-to-video/kling-v2-1/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-v2','video','image_to_video','json','/v1/ai/image-to-video/kling-v2','/v1/ai/image-to-video/kling-v2/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  -- Version 1.6 aliases (endpoints are the same; label via name)
  ('image-to-video-kling-pro-1-6','video','image_to_video','json','/v1/ai/image-to-video/kling-pro','/v1/ai/image-to-video/kling/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-std-1-6','video','image_to_video','json','/v1/ai/image-to-video/kling-std','/v1/ai/image-to-video/kling/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-elements-pro-1-6','video','image_to_video','json','/v1/ai/image-to-video/kling-elements-pro','/v1/ai/image-to-video/kling-elements/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  ),
  ('image-to-video-kling-elements-std-1-6','video','image_to_video','json','/v1/ai/image-to-video/kling-elements-std','/v1/ai/image-to-video/kling-elements/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}}}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Additional Image Generation
INSERT INTO models (name, kind, operation, request_style, request_endpoint, status_endpoint_template, is_async, supports_webhook, params_schema)
VALUES
  ('text-to-image-flux-dev', 'image', 'text_to_image', 'json', '/v1/ai/text-to-image/flux-dev', '/v1/ai/text-to-image/flux-dev/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}},"required":["prompt"]}'::jsonb
  ),
  ('text-to-image-hyperflux', 'image', 'text_to_image', 'json', '/v1/ai/text-to-image/hyperflux', '/v1/ai/text-to-image/hyperflux/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}},"required":["prompt"]}'::jsonb
  ),
  ('text-to-image-seedream', 'image', 'text_to_image', 'json', '/v1/ai/text-to-image/seedream', '/v1/ai/text-to-image/seedream/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}},"required":["prompt"]}'::jsonb
  ),
  ('text-to-image-imagen3', 'image', 'text_to_image', 'json', '/v1/ai/text-to-image/imagen3', '/v1/ai/text-to-image/imagen3/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}},"required":["prompt"]}'::jsonb
  ),
  ('text-to-image-gemini-2.5-flash-image-preview', 'image', 'text_to_image', 'json', '/v1/ai/gemini-2-5-flash-image-preview', '/v1/ai/gemini-2-5-flash-image-preview/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}},"required":["prompt"]}'::jsonb
  ),
  ('text-to-image-classic-fast', 'image', 'text_to_image', 'json', '/v1/ai/text-to-image', '/v1/ai/text-to-image/hyperflux/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}},"required":["prompt"]}'::jsonb
  ),
  ('text-to-image-gemini-2.5-flash', 'image', 'text_to_image', 'json', '/v1/ai/gemini-2-5-flash-image-preview', '/v1/ai/gemini-2-5-flash-image-preview/{task-id}', true, true,
    '{"type":"object","properties":{"prompt":{"type":"string"}},"required":["prompt"]}'::jsonb
  ),
  ('text-to-image-reimagine-flux', 'image', 'text_to_image', 'json', '/v1/ai/beta/text-to-image/reimagine-flux', NULL, true, false,
    '{"type":"object","properties":{"image_url":{"type":"string","format":"uri"}},"required":["image_url"]}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

