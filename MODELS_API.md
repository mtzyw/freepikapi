# 前端调用与模型参数手册（39 个模型）

本手册列出每个模型的调用方式与参数要求，供前端直接对接中转站接口使用。

来源与一致性说明
- 参数权威来源：本文件与数据库种子文件 `db/seed_models.sql` 的 `params_schema`、`request_style`、`request_endpoint`、`status_endpoint_template` 保持一致，等同于后端真实校验/转发逻辑。
- 文档外扩展：若 Freepik 后续在官方文档新增字段，前端可直接把新增字段放进 `payload`，中转站会按 `request_style` 原样透传（JSON 或 multipart/form-data）。
- 同步/异步与回调：`supports_webhook=false` 的模型（例如 `remove-background-beta`）是同步或不回调的能力；其余异步模型都会由中转站处理 webhook 并回调 `callback_url`。

## 统一调用方式
- 入口：`POST /api/task`
- 鉴权：`Authorization: Bearer <proxy-key>` 或 `x-proxy-key: <proxy-key>`
- Body：
  - `model`: 下表的模型名称之一
  - `payload`: 模型参数对象（见各模型“参数”，需与 Freepik 官方字段完全一致）
  - `callback_url`: 前端服务用于接收任务完成回调的地址（必填；同步模型可忽略回调）
- 返回：`{ id, freepik_task_id?, status }`
- 示例：
```http
POST /api/task
Authorization: Bearer <proxy-key>
Content-Type: application/json
{
  "model": "mystic",
  "payload": { "prompt": "a cute corgi", "aspect_ratio": "1:1" },
  "callback_url": "https://c.example.com/fp/callback"
 }
```

说明与规则：
- 中转站不会重命名参数；`payload` 会被按模型的 `request_style` 直接转发（JSON 或表单）。
- 支持 webhook 的异步模型：自动追加 `webhook_url` 字段（值为中转站 Webhook，非前端回调）；任务完成后中转站再回调前端的 `callback_url`。
- 少数同步/不支持 webhook 的模型会直接返回结果或无法被回调追踪（见特别说明）。

## 模型目录（名称 / 类型 / 端点 / 参数）

- mystic / image / `/v1/ai/mystic` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：
    - `webhook_url: string(uri)`
    - `structure_reference: string(base64)`，`structure_strength: integer[0..100]`（默认 50）
    - `style_reference: string(base64)`，`adherence: integer[0..100]`（默认 50），`hdr: integer[0..100]`（默认 50）
    - `resolution: "1k" | "2k" | "4k"`（默认 2k）
    - `aspect_ratio`: `square_1_1 | classic_4_3 | traditional_3_4 | widescreen_16_9 | social_story_9_16 | smartphone_horizontal_20_9 | smartphone_vertical_9_20 | standard_3_2 | portrait_2_3 | horizontal_2_1 | vertical_1_2 | social_5_4 | social_post_4_5`（默认 square_1_1）
    - `model: "realism" | "fluid" | "zen"`（默认 realism）
    - `creative_detailing: integer[0..100]`（默认 33）
    - `engine: "automatic" | "magnific_illusio" | "magnific_sharpy" | "magnific_sparkle"`（默认 automatic）
    - `fixed_generation: boolean`（默认 false）
    - `filter_nsfw: boolean`（默认 true）
    - `styling: object`（详见 freepik文档/mystic.md）
  - 来源：freepik文档/mystic.md

- text-to-image-flux-dev / image / `/v1/ai/text-to-image/flux-dev` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：
    - `webhook_url: string(uri)`
    - `aspect_ratio: square_1_1 | classic_4_3 | traditional_3_4 | widescreen_16_9 | social_story_9_16 | standard_3_2 | portrait_2_3 | horizontal_2_1 | vertical_1_2 | social_post_4_5`（默认 square_1_1）
    - `styling: object`
    - `seed: integer[1..4294967295]`
  - 来源：freepik文档/post-flux-dev.md

- text-to-image-hyperflux / image / `/v1/ai/text-to-image/hyperflux` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：同 flux-dev（`webhook_url`, `aspect_ratio`, `styling`, `seed`）
  - 来源：freepik文档/get-hyperflux.md

- text-to-image-seedream / image / `/v1/ai/text-to-image/seedream` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：同 flux-dev（`webhook_url`, `aspect_ratio`, `styling`, `seed`）
  - 来源：freepik文档/post-seedream.md

- text-to-image-imagen3 / image / `/v1/ai/text-to-image/imagen3` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：
    - `webhook_url: string(uri)`
    - `num_images: integer[1..4]`（默认 1）
    - `aspect_ratio: square_1_1 | social_story_9_16 | widescreen_16_9 | traditional_3_4 | classic_4_3`（默认 square_1_1）
    - `styling: object`
    - `person_generation: dont_allow | allow_adult | allow_all`（默认 allow_all）
    - `safety_settings: block_low_and_above | block_medium_and_above | block_only_high | block_none`（默认 block_none）
  - 来源：freepik文档/post-imagen3.md

- text-to-image-gemini-2.5-flash-image-preview / image / `/v1/ai/gemini-2-5-flash-image-preview` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：
    - `reference_images: string[]`（最多 3，元素为 Base64 或公开 URL）
    - `webhook_url: string(uri)`
  - 来源：freepik文档/gemini-2-5-flash-image-preview.md

- text-to-image-classic-fast / image / `/v1/ai/text-to-image` / JSON（webhook 支持，异步）
  - 必填：`prompt: string(minLength=3)`
  - 可选：
    - `negative_prompt: string(minLength=3)`
    - `styling: object`
    - `guidance_scale: number[0..2]`（默认 1.0）
    - `image.size: enum(aspect)`
    - `num_images: integer[1..4]`（默认 1）
    - `seed: integer[0..1000000]`
    - `filter_nsfw: boolean`（默认 true）
  - 来源：freepik文档/get-image-from-text.md

- text-to-image-gemini-2.5-flash / image / `/v1/ai/gemini-2-5-flash-image-preview` / JSON（webhook 支持，异步）
  - 与上条相同（别名）。

  - 必填：`image_url: string(uri)`
  - 特别说明：若官方无状态查询模板，则本模型结果不可通过中转站回调追踪，适用于同步直返或前端自行拉取。
  - 选填：无
  - 来源：freepik文档/post-reimagine-flux.md

- image-upscaler / edit / `/v1/ai/image-upscaler` / JSON（webhook 支持，异步）
  - 必填：`image: string(base64)`
  - 可选：
    - `webhook_url: string(uri)`
    - `scale_factor: "2x" | "4x" | "8x" | "16x"`（默认 2x）
    - `optimized_for: standard | soft_portraits | hard_portraits | art_n_illustration | videogame_assets | nature_n_landscapes | films_n_photography | 3d_renders | science_fiction_n_horror`（默认 standard）
    - `prompt: string`
    - `creativity: integer[-10..10]`（默认 0）
    - `hdr: integer[-10..10]`（默认 0）
    - `resemblance: integer[-10..10]`（默认 0）
    - `fractality: integer[-10..10]`（默认 0）
    - `engine: automatic | magnific_illusio | magnific_sharpy | magnific_sparkle`（默认 automatic）
  - 来源：freepik文档/image-upscaler.md

- image-upscaler-precision / edit / `/v1/ai/image-upscaler-precision` / JSON（webhook 支持，异步）
  - 必填：`image: string(base64)`
  - 可选：
    - `webhook_url: string(uri)`
    - `sharpen: integer[0..100]`（默认 50）
    - `smart_grain: integer[0..100]`（默认 7）
    - `ultra_detail: integer[0..100]`（默认 30）
  - 来源：freepik文档/post-image-upscaler-precision.md

- image-relight / edit / `/v1/ai/image-relight` / JSON（webhook 支持，异步）
  - 必填：`image: string(base64|url)`
  - 可选：
    - `webhook_url: string(uri)`
    - `prompt: string`
    - `transfer_light_from_reference_image: string(base64|url)` 与 `transfer_light_from_lightmap: string(base64|url)`（二选一，不可同时）
    - `light_transfer_strength: integer[0..100]`（默认 100）
    - `interpolate_from_original: boolean`（默认 false）
    - `change_background: boolean`（默认 true）
    - `style: standard | darker_but_realistic | clean | smooth | brighter | contrasted_n_hdr | just_composition`（默认 standard）
    - `preserve_details: boolean`（默认 true）
    - `advanced_settings: object`
  - 来源：freepik文档/image-relight.md

- image-expand / edit / `/v1/ai/image-expand/flux-pro` / JSON（webhook 支持，异步）
  - 必填：`image: string(base64)`
  - 可选：
    - `webhook_url: string(uri)`
    - `prompt: string`
    - `left/right/top/bottom: integer[0..2048]`（按方向扩展像素，留空表示不扩展）
  - 来源：freepik文档/post-flux-pro.md（状态查询：freepik文档/get-flux-pro.md）

- remove-background-beta / edit / `/v1/ai/beta/remove-background` / FORM（同步，不支持 webhook）
  - 必填：`image_url: string(uri)`（表单字段）
  - 特别说明：请求为 `application/x-www-form-urlencoded`，返回临时 URL（有效期约 5 分钟），中转站不跟踪回调。
  - 选填：无
  - 来源：freepik文档/post-beta-remove-background.md

- image-style-transfer / edit / `/v1/ai/image-style-transfer` / JSON（webhook 支持，异步）
  - 必填：`image: string(base64|url)`, `reference_image: string(base64|url)`
  - 可选：
    - `webhook_url: string(uri)`
    - `prompt: string`
    - `style_strength: integer[0..100]`（默认 100）
    - `structure_strength: integer[0..100]`（默认 50）
    - `is_portrait: boolean`（默认 false）
    - `portrait_style: standard | pop | super_pop`
    - `portrait_beautifier: beautify_face | beautify_face_max`
    - `flavor: faithful | gen_z | psychedelia | detaily | clear | donotstyle | donotstyle_sharp`（默认 faithful）
    - `engine: balanced | definio | illusio | 3d_cartoon | colorful_anime | caricature | real | super_real | softy`（默认 balanced）
    - `fixed_generation: boolean`（默认 false）
  - 来源：freepik文档/post-image-style-transfer.md

- image-to-video-minimax / video / `/v1/ai/image-to-video/minimax` / JSON（webhook 支持，异步）
  - 常见字段：`webhook_url?`, `prompt`, `first_frame_image? (url|base64)`, `duration?`
  - 1080p/768p 变体：详见下方具体模型（1080p 仅 6 秒）。

 - image-to-video-wan-480p / video / `/v1/ai/image-to-video/wan-v2-2-480p` / JSON（webhook 支持，异步）
  - 常见字段：`webhook_url?`, `prompt`, `first_frame_image?`, `duration?`（与 580p/720p 形态一致）

- image-to-video-wan-580p / video / `/v1/ai/image-to-video/wan-v2-2-580p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：`first_frame_image: string(uri)`, `duration: number`
  - 来源：freepik文档/post-wan-v2-2-580p.md

- image-to-video-wan-720p / video / `/v1/ai/image-to-video/wan-v2-2-720p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：`first_frame_image: string(uri)`, `duration: number`
  - 来源：freepik文档/post-wan-v2-2-720p.md

 - image-to-video-seedance-pro-720p / video / `/v1/ai/image-to-video/seedance-pro-720p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：
    - `webhook_url: string(uri)`
    - `image: string(base64|url)`
    - `duration: '5' | '10'`（默认 '5'）
    - `camera_fixed: boolean`（默认 false）
    - `aspect_ratio: widescreen_16_9 | social_story_9_16 | square_1_1`
    - `frames_per_second: 24`
    - `seed: integer[-1..4294967295]`（默认 -1 表示随机）
  - 来源：freepik文档/post-seedance-pro-720p.md

 - image-to-video-seedance-pro-1080p / video / `/v1/ai/image-to-video/seedance-pro-1080p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：同 720p（`image`/`duration('5'|'10')`/`camera_fixed`/`aspect_ratio`/`fps`/`seed`/`webhook_url`）
  - 来源：freepik文档/post-seedance-pro-1080p.md

 - image-to-video-kling-v2 / video / `/v1/ai/image-to-video/kling-v2` / JSON（webhook 支持，异步）
  - 必填：`image: string(base64|url)` 与/或 `prompt: string`（根据模式）
  - 可选：
    - `webhook_url: string(uri)`
    - `negative_prompt: string`
    - `duration: '5' | '10'`（字符串）
    - `cfg_scale: number[0..1]`（默认 0.5）
  - 来源：freepik文档/post-kling-v2.md

 - image-to-video-kling-elements-pro / video / `/v1/ai/image-to-video/kling-elements-pro` / JSON（webhook 支持，异步）
  - 必填：`images: string[] (url)`（最多 4 张；jpg/jpeg/png；≥300x300px；宽高比 1:2.5~2.5:1；≤10MB/张）
  - 可选：
    - `prompt: string(max 2500)`，`negative_prompt: string(max 2500)`
    - `duration: '5' | '10'`
    - `aspect_ratio: widescreen_16_9 | social_story_9_16 | square_1_1`（默认 widescreen_16_9）
    - `webhook_url: string(uri)`
  - 来源：freepik文档/post-kling-elements-pro.md

 - image-to-video-kling-elements-std / video / `/v1/ai/image-to-video/kling-elements-std` / JSON（webhook 支持，异步）
  - 必填：`images: string[] (url)`（最多 4 张；jpg/jpeg/png；≥300x300px；宽高比 1:2.5~2.5:1；≤10MB/张）
  - 可选：同 Elements Pro（`prompt`/`negative_prompt`/`duration`/`aspect_ratio`/`webhook_url`）
  - 来源：freepik文档/post-kling-elements-std.md

 - image-to-video-kling-pro / video / `/v1/ai/image-to-video/kling-pro` / JSON（webhook 支持，异步）
  - 必填：`duration: '5' | '10'`
  - 可选：
    - `image: string(base64|url)`，`image_tail: string(base64|url)`（二者至少一项必填；tail 为结束帧控制。与“标准模式”不兼容）
    - `prompt: string(max 2500)`，`negative_prompt: string(max 2500)`
    - `cfg_scale: number[0..1]`（默认 0.5）
    - `static_mask: string(base64|url)`（掩模分辨率/宽高比需与 image/dynamic_masks 一致）
    - `dynamic_masks: Array<{ mask: string(base64|url); trajectories: Array<{ x: number; y: number }> }>`
    - `webhook_url: string(uri)`
  - 来源：freepik文档/post-kling-pro.md
  - 来源：freepik文档/post-kling-pro.md

 - image-to-video-kling-std / video / `/v1/ai/image-to-video/kling-std` / JSON（webhook 支持，异步）
  - 与 `kling-pro` 参数一致（支持 `image`/`image_tail`、`static_mask`、`dynamic_masks` 等），`duration: '5' | '10'`
  - 来源：freepik文档/post-kling-std.md
  - 来源：freepik文档/post-kling-std.md

 - image-to-video-kling-v2-1-master / video / `/v1/ai/image-to-video/kling-v2-1-master` / JSON（webhook 支持，异步）
  - 必填：`duration: '5' | '10'`
  - 可选：
    - `image: string(base64|url)`（I2V 模式）；或仅 `prompt`（T2V 模式，且可用 `aspect_ratio: widescreen_16_9 | social_story_9_16 | square_1_1`，默认 widescreen_16_9）
    - `prompt: string(max 2500)`，`negative_prompt: string(max 2500)`
    - `cfg_scale: number[0..1]`（默认 0.5）
    - `static_mask: string(base64|url)`
    - `dynamic_masks: Array<{ mask: string(base64|url); trajectories: Array<{ x: number; y: number }> }>`
    - `webhook_url: string(uri)`
  - 来源：freepik文档/post-kling-v2-1-master.md
  - 来源：freepik文档/post-kling-v2-1-master.md

 - image-to-video-kling-v2-1-pro / video / `/v1/ai/image-to-video/kling-v2-1-pro` / JSON（webhook 支持，异步）
  - 参数同 `kling-v2-1-master`，支持 I2V/T2V、mask、dynamic_masks、cfg_scale、duration '5'|'10'
  - 来源：freepik文档/post-kling-v2-1-pro.md
  - 来源：freepik文档/post-kling-v2-1-pro.md

 - image-to-video-kling-v2-1-std / video / `/v1/ai/image-to-video/kling-v2-1-std` / JSON（webhook 支持，异步）
  - 参数同 `kling-v2-1-master`
  - 来源：freepik文档/post-kling-v2-1-std.md
  - 来源：freepik文档/post-kling-v2-1-std.md

- image-to-video-kling-pro-1-6 / video / `/v1/ai/image-to-video/kling-pro` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 选填：无
  - 来源：freepik文档/post-kling-pro.md

- image-to-video-kling-std-1-6 / video / `/v1/ai/image-to-video/kling-std` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 选填：无
  - 来源：freepik文档/post-kling-std.md

- image-to-video-kling-elements-pro-1-6 / video / `/v1/ai/image-to-video/kling-elements-pro` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 选填：无
  - 来源：freepik文档/post-kling-elements-pro.md

- image-to-video-kling-elements-std-1-6 / video / `/v1/ai/image-to-video/kling-elements-std` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 选填：无
  - 来源：freepik文档/post-kling-elements-std.md

- image-to-video-minimax-hailuo-02-1080p / video / `/v1/ai/image-to-video/minimax-hailuo-02-1080p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：`first_frame_image: string(uri)`, `duration: number`
  - 来源：freepik文档/post-minimax-hailuo-02-1080p.md

 - image-to-video-minimax-hailuo-02-768p / video / `/v1/ai/image-to-video/minimax-hailuo-02-768p` / JSON（webhook 支持，异步）
  - 模式：Text-to-Video 或 Image-to-Video
  - 必填：
    - ITV：`prompt`
    - I2V：`prompt`, `first_frame_image(url|base64)`
  - 可选：
    - `webhook_url`, `prompt_optimizer: boolean`（默认 true）
    - `duration: 6 | 10`
  - 来源：freepik文档/post-minimax-hailuo-02-768p.md

 - image-to-video-seedance-lite-1080p / video / `/v1/ai/image-to-video/seedance-lite-1080p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：
    - `webhook_url: string(uri)`
    - `image: string(base64|url)`
    - `duration: '5' | '10'`（默认 '5'）
    - `camera_fixed: boolean`（默认 false）
    - `aspect_ratio: widescreen_16_9 | social_story_9_16 | square_1_1`
    - `frames_per_second: 24`
    - `seed: integer[-1..4294967295]`（默认 -1 表示随机）
  - 来源：freepik文档/post-seedance-lite-1080p.md

 - image-to-video-seedance-lite-480p / video / `/v1/ai/image-to-video/seedance-lite-480p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：同 1080p 版本（`image`/`duration`/`camera_fixed`/`aspect_ratio`/`fps`/`seed`/`webhook_url`）
  - 来源：freepik文档/post-seedance-lite-480p.md

 - image-to-video-seedance-lite-720p / video / `/v1/ai/image-to-video/seedance-lite-720p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：同 1080p 版本
  - 来源：freepik文档/post-seedance-lite-720p.md

 - image-to-video-seedance-pro-480p / video / `/v1/ai/image-to-video/seedance-pro-480p` / JSON（webhook 支持，异步）
  - 必填：`prompt: string`
  - 可选：同 Pro 720p（`image`/`duration`/`camera_fixed`/`aspect_ratio`/`fps`/`seed`/`webhook_url`）
  - 来源：freepik文档/post-seedance-pro-480p.md

## 回调与结果
- 异步模型：中转站在任务完成/失败后向 `callback_url` 发送 `POST`，body 形如：`{ id, freepik_task_id, status, result_urls?, r2_objects? }`。
- 同步/不支持 webhook：结果直接由 `/api/task` 响应或不可跟踪。

回调示例（成功）：
```json
{
  "id": "tsk_abc12345",
  "freepik_task_id": "fp_xyz678",
  "status": "COMPLETED",
  "result_urls": ["https://cdn.freepik.../image1.jpg"],
  "r2_objects": [
    { "bucket": "r2-bucket", "key": "tasks/tsk_abc12345/0.jpg", "public_url": "https://cdn.example.com/tasks/tsk_abc12345/0.jpg" }
  ]
}
```

## 常见问题
- 轮询兜底：若 60s 内未回调则进入轮询；240s 超时标记 FAILED。
- R2 存储：生成的外链（如配置 `R2_PUBLIC_BASE_URL`）在回调的 `r2_objects[].public_url` 中返回。
- 必填项：本文基于 `db/seed_models.sql` 的 `params_schema`，如上游字段更新，请以该表为准。

## 常见参数对齐说明（与官方保持一致）
- 生成类（text-to-image / image-to-video）常见字段：`prompt`、`first_frame_image`、`duration`、`aspect_ratio`、`seed`、`guidance_scale` 等；名称与类型需与 Freepik 文档一致。
- 编辑类常见字段：`image_url`、以及各自能力的可选参数（如 `scale`、`target_resolution`、`width/height`、`style`）。
- 额外参数：如果 Freepik 文档定义了更多字段，可直接放入 `payload`，中转站会透传给上游（JSON 或表单）。
