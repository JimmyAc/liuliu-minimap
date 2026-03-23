# liuliu-miniapp

`liuliu-miniapp` is a standalone native WeChat Mini Program scaffold for the City Walk product in `liuliu`.

Current scope is an MVP:
- WeChat login and user sync
- AI theme generation via cloud function
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

## Notes

- Gemini calls are server-side only. Put your API key in cloud function env or secure config.
- The first version uses JavaScript for the fastest setup path.
- Audio/video, community theme submission, and share poster generation are intentionally left for phase 2.
