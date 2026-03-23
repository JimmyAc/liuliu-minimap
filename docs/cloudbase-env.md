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

For production, keep Gemini API key in cloud function environment variables, not in frontend code.
