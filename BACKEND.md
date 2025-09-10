# 后端技术文档（Freepik 中转站）

## 概览
- 目标：为 C 站点提供统一的 Freepik AI 能力中转层，负责任务受理、上游请求分发、结果回调、R2 存储及轮询兜底。
- 技术栈：Next.js 15（App Router，`src/app/api/*`）、TypeScript、Supabase（Postgres + JS SDK）、Cloudflare R2（S3 兼容）、Upstash QStash（可选）。
- 代码位置：
  - API：`src/app/api/*`
  - 业务：`src/services/*`
  - 数据访问：`src/repo/*`
  - 基础设施：`src/lib/*`
  - SQL：`db/*.sql`（原始）与 `drizzle/*.sql`（迁移）

## 数据模型（Postgres/Supabase）
核心表（参见 `db/schema.sql`）：
- `tasks`：任务主表。字段要点：`type(image|video|edit)`、`model`、`status(PENDING/IN_PROGRESS/COMPLETED/FAILED)`、`freepik_task_id`、`api_key_id`、`input_payload`、`result_urls`、`r2_objects`、`started_at/completed_at`。
- `models`：上游模型目录（名称、分类、请求风格/端点、状态查询模板等），用于按 `model` 动态分发（见 `seed_models.sql`）。
- `api_keys` + `api_key_usage`：上游 Freepik API Key 与按日用量；`repoSelectApiKey` 选择未超限的活跃 Key。
- `proxy_keys`：中转站访问鉴权（Authorization Bearer 或 `x-proxy-key`）。
- `assets`：R2 入库映射（任务产物文件的 `bucket/object_key/public_url` 等）。
- `scheduler_state`：轮询自调度的去重状态。
- 其他（可选）：`sites`、`callbacks`、`webhooks_inbound`、`rate_limits`、`idempotency_keys` 为扩展设计，当前代码主要使用上述核心表。

索引与约束：`tasks.freepik_task_id` 唯一；`api_key_usage`(api_key_id, day) 唯一；`assets`(task_id, object_key) 唯一。

## 业务流程
1) 接单（/api/task，`src/app/api/task/route.ts`）
- 鉴权：`requireProxyAuth` 校验代理密钥（`repoVerifyProxyKey` 对比 `proxy_keys.token_hash`）。
- 请求体：`{ model? , type? , payload , callback_url , c_site_id? }`；`callback_url` 必填，`model` 或 `type` 必填。
- 当传入 `model`：从 `models` 读取端点/风格，`dispatchFreepikTask` 统一分发；否则按 `type` 调用 `createImageTask`/`createVideoTask`。
- 选 Key：`repoSelectApiKey` 按日用量最少且未超限优先。
- 入库：`repoCreateTask` 记录任务（初始 PENDING/IN_PROGRESS），保存上游 `task_id` 与初始响应。
- Webhook：统一传 `webhook_url = {SITE_URL}/api/webhook/freepik`。

参数保持一致（与 Freepik 官方）：
- 中转仅做“转发+鉴权+回调拼接”，不会改写字段名与语义；前端 `payload` 的字段必须与 Freepik 文档一致（详见 MODELS_API.md）。
- JSON 风格模型：`payload` 作为 JSON 直传，并自动追加 `webhook_url`（若模型支持异步 webhook）。
- 表单风格模型：`payload` 展平为 multipart/form-data（`request_style = 'form'` 的模型，如 remove-background-beta）。

2) Webhook 回调（/api/webhook/freepik）
- 解析 `task_id/status/generated[]`，依据 `freepik_task_id` 查任务。
- `finalizeAndNotify`：
  - 避免重复终态（并发 webhook/轮询竞态防抖）。
  - 若 COMPLETED：`storeResultsToR2` 拉取产物并上传 R2，写入 `assets` 与 `tasks.r2_objects`。
  - 更新 `tasks.status/result_urls/result_payload`。
  - 若存在 `callback_url`，向 C 站 POST 回调简报。

3) 轮询兜底（/api/admin/poll 与 /api/qstash/poll）
- 扫描 `IN_PROGRESS` 任务；<60s 跳过，≥240s 视为超时 FAILED 并 finalize。
- 正常轮询：`getStatusForModel(model, freepik_task_id)` 查询状态，COMPLETED 则 finalize。
- QStash 入口校验 `Upstash-Signature`（若配置签名 Key），并在有未完成任务时自调度下一次（`qstashSchedulePoll` + `scheduler_state` 去重）。

4) R2 存储（`src/lib/r2.ts`, `src/services/storage.ts`）
- 以 `tasks/{taskId}/{index}.{ext}` 命名；支持流式分片上传（8MB part）。
- 可选 `R2_PUBLIC_BASE_URL` 生成 `public_url`。上传完成后批量插入 `assets`。

## API 设计（摘要）
- POST `/api/task`
  - 入参：`model` 或 `type`，`payload`（各模型字段见 `models.params_schema`），`callback_url`。
  - 返回：`{ id, freepik_task_id?, status }`。
  - 错误：400 参数缺失；401/403 鉴权失败；503 无可用上游 Key；500 内部错误。
- POST `/api/webhook/freepik`：上游回调入口；返回 `{ ok: true }`。
- GET `/api/admin/poll`：后台轮询（手动/定时器可调用）。
- POST `/api/qstash/poll`：QStash 轮询入口（含签名校验与自调度）。
- GET `/api/health`：运行状况。

示例创建（模型分发）：
```http
POST /api/task
Authorization: Bearer <proxy-key>
Content-Type: application/json
{
  "model": "mystic",
  "payload": { "prompt": "a cute corgi" },
  "callback_url": "https://c.example.com/fp/callback"
}
```

## 配置与安全
- 环境变量：见 `src/lib/env.ts`。必须项：Supabase 服务密钥（写 DB）、`NEXT_PUBLIC_SITE_URL`，可选：R2、QStash。
- 代理密钥：仅保存 `token_hash`/`key_hash`，不存明文；当前代码直接使用 `key_cipher` 作为上游 Key 字段，生产应由 KMS/密钥服务解密后再用。
- Webhook 入站签名：表结构预留（`webhooks_inbound`/`webhook_secrets`），当前 `/api/webhook/freepik` 未校验签名。如 Freepik 提供签名头（参见 freepikfull.txt 相应章节），建议按版本化密钥实现校验并落库。

## 运维建议
- 初始化：`pnpm run db:init` 或 `pnpm run db:migrate`，并用 `db/seed_models.sql` 预置 `models`。
- 日常：监控 `tasks` 终态率、`api_key_usage` 用量、`assets` 写入错误；必要时调整轮询阈值与重试策略。
- 本地联调：可设 `MOCK_FREEPIK=1` 跳过真实上游。
