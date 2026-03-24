# Cloudbase Setup

1. Create a cloud environment in WeChat DevTools.
2. Replace `your-cloud-env-id` in `miniprogram/utils/config.js`.
3. In each cloud function directory, run `npm install`.
4. Deploy the cloud functions.
5. Create database collections:
   - `users`
   - `walkRecords`
   - `walkThemes`
6. Grant frontend read/write permissions according to your release policy.

For production, keep AI provider keys in cloud function environment variables, not in frontend code.

## Recommended Mainland AI Setup

Use an OpenAI-compatible provider that is easier to access from mainland China.

Suggested environment variables for `generateTheme` and `getLocationContext`:
- `AI_API_KEY`: your provider key
- `AI_BASE_URL`: provider compatible endpoint base URL
- `AI_CHAT_MODEL`: chat model name

Example with DashScope Qwen:
- `AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
- `AI_CHAT_MODEL=qwen-plus`

Example with DeepSeek:
- `AI_BASE_URL=https://api.deepseek.com/v1`
- `AI_CHAT_MODEL=deepseek-chat`
