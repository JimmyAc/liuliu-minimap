# liuliu-miniapp

## 中文说明

`liuliu-miniapp` 是 `liuliu` 网页版 City Walk 产品的独立原生微信小程序实现，目前基于微信云开发运行。

当前范围是一个可运行的 MVP，已包含：
- 微信登录与用户资料同步
- 基于云函数的 RAG + AI 漫步主题生成
- 当前位置 / 手动选点与地点语境生成
- 漫步草稿、任务清单、文字记录、图片记录与轨迹记录
- 足迹保存到云数据库
- 我的足迹列表
- 社区公开足迹列表

### 项目结构

- `miniprogram/`：原生微信小程序前端
- `cloudfunctions/`：微信云函数
- `docs/`：部署、数据结构与构建说明文档

### 运行前准备

1. 在微信开发者工具中新建或导入一个小程序项目。
2. 将项目根目录指向当前仓库。
3. 打开 `miniprogram/utils/config.js`，填写真实云环境 ID。
4. 在每个云函数目录中执行 `npm install`。
5. 在微信开发者工具中部署云函数。
6. 按 `docs/data-model.md` 创建数据库集合。

### 当前云函数

当前已实现并可部署的云函数包括：
- `syncUser`
- `generateTheme`
- `getLocationContext`
- `createWalk`
- `listMyWalks`
- `listPublicWalks`
- `generateRandomTheme`
- `generateCombinedTheme`
- `verifyMission`
- `getWalkDetail`

### 轻量 RAG 说明

`generateTheme` 当前使用轻量 RAG 再调用 AI：
- 先根据地点、偏好、天气、心情等检索场景画像
- 再检索色彩、纹理、形状、声音、城市观察等任务模板
- 将检索结果注入提示词后生成主题
- 当 AI 提供方不可用或响应过慢时，退回到本地 RAG fallback 主题

### 配置说明

- AI 调用全部在服务端云函数中完成，不应把 Key 放在前端。
- 推荐使用中国大陆访问更稳定的 OpenAI 兼容服务，例如 DashScope、DeepSeek、SiliconFlow。
- `generateTheme`、`getLocationContext`、`generateRandomTheme`、`generateCombinedTheme`、`verifyMission` 建议配置以下环境变量：
  - `AI_API_KEY`
  - `AI_BASE_URL`（例如 `https://dashscope.aliyuncs.com/compatible-mode/v1`）
  - `AI_CHAT_MODEL`（例如 `qwen-turbo` 更快，`qwen-plus` 质量更高）
  - `AI_REQUEST_TIMEOUT_MS`（可选，用于快速失败，避免云函数 3 秒超时）
  - `DEBUG_RAG_CONTEXT`（可选，仅调试时设为 `true`）
- 当前版本优先保证最小可运行链路，因此仍采用 JavaScript 快速实现。
- 音频 / 视频记录、社区投稿审核、海报导出等功能仍在后续阶段。

---

### 2026.3.24 本次更新 

本轮迭代补上了小程序版与网页 demo 之间的关键差距：
- 首页恢复展示栏，显示当前模式、任务数量与结果来源
- 恢复 `随机主题` 与 `组合主题` 能力
- 强化 `纯粹模式` 与 `进阶模式` 的差异，前者保留 1 个任务，后者保留 3 个任务
- 图片上传改为支持一次多选
- 新增足迹详情页，历史与社区列表都可进入详情
- 优化当前位置语境生成，优先补足更具体的地点名再生成语境
- 新增任务 AI 核验：按“图文一起核验、尽量宽松、无论通过与否都返回简短评价语”的方式完成打卡

更多细节可参考：
- `docs/wechat-build-guide.md`
- `docs/cloudbase-env.md`
- `docs/rag-notes.md`

---

## English

`liuliu-miniapp` is a standalone native WeChat Mini Program implementation of the `liuliu` web-based City Walk product, currently running on WeChat Cloud Development.

The current scope is a working MVP with:
- WeChat login and user profile sync
- RAG + AI walk theme generation through cloud functions
- current location / manual location picking and location-context generation
- walk draft, mission list, notes, photo capture, and route tracking
- walk record saving to the cloud database
- My Walks list
- public community walk feed

### Project Structure

- `miniprogram/`: native WeChat Mini Program frontend
- `cloudfunctions/`: WeChat cloud functions
- `docs/`: deployment, data model, and build documentation

### Before Running

1. Create or import a Mini Program project in WeChat DevTools.
2. Point the project root to this repository.
3. Open `miniprogram/utils/config.js` and set the real cloud environment ID.
4. Run `npm install` inside each cloud function directory.
5. Deploy the cloud functions from WeChat DevTools.
6. Create the database collections described in `docs/data-model.md`.

### Available Cloud Functions

The following cloud functions are currently implemented and ready to deploy:
- `syncUser`
- `generateTheme`
- `getLocationContext`
- `createWalk`
- `listMyWalks`
- `listPublicWalks`
- `generateRandomTheme`
- `generateCombinedTheme`
- `verifyMission`
- `getWalkDetail`

### Lightweight RAG

`generateTheme` now uses a lightweight RAG layer before calling the AI provider:
- it retrieves scene profiles based on location, preference, weather, mood, and related signals
- it retrieves mission templates for color, texture, shape, sound, and city observation
- it injects the retrieved context into the prompt
- it falls back to a local RAG-based theme when the AI provider is unavailable or too slow

### Configuration Notes

- All AI calls are server-side in cloud functions, so keys should never be exposed in the frontend.
- Mainland-friendly OpenAI-compatible services such as DashScope, DeepSeek, or SiliconFlow are recommended.
- `generateTheme`, `getLocationContext`, `generateRandomTheme`, `generateCombinedTheme`, and `verifyMission` should typically use these environment variables:
  - `AI_API_KEY`
  - `AI_BASE_URL` (for example `https://dashscope.aliyuncs.com/compatible-mode/v1`)
  - `AI_CHAT_MODEL` (for example `qwen-turbo` for speed, `qwen-plus` for better quality)
  - `AI_REQUEST_TIMEOUT_MS` (optional, used for fast failure to avoid the cloud function 3-second timeout)
  - `DEBUG_RAG_CONTEXT` (optional, set to `true` only for debugging)
- The current version favors a fast and minimal working path, so it still uses JavaScript.
- Audio/video capture, community submission moderation, and poster export are still planned for later phases.

### This Update

This iteration closes several major gaps between the Mini Program and the original web demo:
- restores the homepage display bar to show mode, mission count, and result source
- restores `Random Theme` and `Combined Theme` generation
- strengthens the difference between `Pure Mode` and `Advanced Mode`, with 1 mission in pure mode and 3 missions in advanced mode
- changes photo upload to support multi-selection in one pick action
- adds a walk detail page accessible from both history and community lists
- improves current-location context generation by resolving a more specific place name before generating the context label
- adds AI-assisted mission verification using image + text, with intentionally lenient judgment and a short feedback message whether the mission passes or not

For more details, see:
- `docs/wechat-build-guide.md`
- `docs/cloudbase-env.md`
- `docs/rag-notes.md`
