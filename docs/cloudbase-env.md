# 微信云开发配置 / Cloudbase Setup

## 中文

### 基础步骤

1. 在微信开发者工具中创建或选择一个云环境。
2. 将 `miniprogram/utils/config.js` 中的 `cloudEnvId` 替换为真实环境 ID。
3. 在每个云函数目录中执行 `npm install`。
4. 在微信开发者工具中部署云函数。
5. 创建数据库集合：
   - `users`
   - `walkRecords`
   - `walkThemes`
6. 根据当前发布策略配置数据库权限。

生产环境中，AI 提供方的 Key 必须放在云函数环境变量中，不能放在前端代码里。

### 推荐的中国大陆 AI 配置

当前项目使用 OpenAI 兼容接口，推荐接入中国大陆访问更稳定的服务。

建议为 `generateTheme`、`getLocationContext`、`generateRandomTheme`、`generateCombinedTheme`、`verifyMission` 配置以下环境变量：

- `AI_API_KEY`：AI 平台密钥
- `AI_BASE_URL`：兼容接口基地址
- `AI_CHAT_MODEL`：文本模型名称
- `AI_REQUEST_TIMEOUT_MS`：可选，提前失败超时配置
- `DEBUG_RAG_CONTEXT`：可选，仅调试时开启

DashScope / 通义千问示例：

- `AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
- `AI_CHAT_MODEL=qwen-turbo`

DeepSeek 示例：

- `AI_BASE_URL=https://api.deepseek.com/v1`
- `AI_CHAT_MODEL=deepseek-chat`

### 本次更新相关

本轮新增的云函数也依赖同一套云环境与环境变量体系：

- `generateRandomTheme`
- `generateCombinedTheme`
- `verifyMission`
- `getWalkDetail`

其中 `verifyMission` 还依赖图片文件可被云存储临时访问，因此部署后需要确认图片上传与 `cloud.getTempFileURL` 可正常工作。

---

## English

### Basic Steps

1. Create or select a cloud environment in WeChat DevTools.
2. Replace `cloudEnvId` in `miniprogram/utils/config.js` with the real environment ID.
3. Run `npm install` inside each cloud function directory.
4. Deploy the cloud functions from WeChat DevTools.
5. Create the following database collections:
   - `users`
   - `walkRecords`
   - `walkThemes`
6. Configure database permissions according to the current release policy.

In production, AI provider keys must stay in cloud function environment variables and should never be placed in frontend code.

### Recommended Mainland AI Setup

The project now uses an OpenAI-compatible API and is best paired with providers that are easier to access from mainland China.

It is recommended to configure the following environment variables for `generateTheme`, `getLocationContext`, `generateRandomTheme`, `generateCombinedTheme`, and `verifyMission`:

- `AI_API_KEY`: provider key
- `AI_BASE_URL`: compatible API base URL
- `AI_CHAT_MODEL`: text model name
- `AI_REQUEST_TIMEOUT_MS`: optional fast-fail timeout setting
- `DEBUG_RAG_CONTEXT`: optional, enable only for debugging

Example with DashScope Qwen:

- `AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
- `AI_CHAT_MODEL=qwen-turbo`

Example with DeepSeek:

- `AI_BASE_URL=https://api.deepseek.com/v1`
- `AI_CHAT_MODEL=deepseek-chat`

### Related to This Update

The newly added cloud functions also depend on the same cloud environment and environment variable setup:

- `generateRandomTheme`
- `generateCombinedTheme`
- `verifyMission`
- `getWalkDetail`

`verifyMission` also depends on temporary access to images in cloud storage, so after deployment you should confirm that image upload and `cloud.getTempFileURL` work correctly.
