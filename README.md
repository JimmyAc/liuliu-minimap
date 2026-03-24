# liuliu-miniapp

`liuliu-miniapp` is a standalone native WeChat Mini Program scaffold for the City Walk product in `liuliu`.

Current scope is an MVP:
- WeChat login and user sync
- RAG-backed AI theme generation via cloud function
- Current location and location context
- Walk draft with mission checklist, note, photo, and route points
- Save walk record to cloud database
- My history page
- Public community feed page

## Project Structure

- `miniprogram/`: native mini program frontend
- `cloudfunctions/`: cloud function stubs
- `docs/`: setup and data model notes

## Before Running

1. Create a new WeChat Mini Program project in WeChat DevTools.
2. Set the project root to this repository.
3. Open `miniprogram/utils/config.js` and replace the placeholder cloud env id.
4. In each cloud function folder, run `npm install`.
5. Deploy cloud functions from WeChat DevTools.
6. Create the database collections described in `docs/data-model.md`.

## Cloud Functions

Implemented as stubs ready for deployment:
- `syncUser`
- `generateTheme`
- `getLocationContext`
- `createWalk`
- `listMyWalks`
- `listPublicWalks`

## Lightweight RAG

`generateTheme` now uses a lightweight RAG layer before calling AI:
- retrieve matching scene profiles from location and preference keywords
- retrieve mission templates for color, texture, shape, sound, and city-life exploration
- inject retrieved context into the prompt
- fall back to retrieved template-based missions when the AI provider is unavailable or slow

## Notes

- AI calls are server-side only. Recommended mainland-friendly setup uses an OpenAI-compatible provider such as DashScope, DeepSeek, or SiliconFlow.
- Configure these cloud function environment variables for `generateTheme` and `getLocationContext`:
  - `AI_API_KEY`
  - `AI_BASE_URL` (example: `https://dashscope.aliyuncs.com/compatible-mode/v1`)
  - `AI_CHAT_MODEL` (example: `qwen-turbo` for faster response, `qwen-plus` for better quality)
  - `AI_REQUEST_TIMEOUT_MS` (optional, default fast-fail timeout to avoid cloud function 3s timeout)
  - `DEBUG_RAG_CONTEXT` (optional, set `true` only when you want verbose logs)
- The first version uses JavaScript for the fastest setup path.
- Audio/video, community theme submission, and share poster generation are intentionally left for phase 2.
