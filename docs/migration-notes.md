# Migration Notes

This mini program keeps the original product core from `liuliu`:
- AI-generated city walk themes
- location-aware exploration
- walk record saving
- community feed

What changed for the mini program MVP:
- React web UI is replaced by native WeChat pages
- Firebase is replaced by WeChat cloud database and cloud storage
- browser geolocation/media APIs are replaced by WeChat APIs
- AI calls move from frontend to cloud functions

Deferred to phase 2:
- audio/video recording
- combined theme generation
- custom theme submission and moderation
- nine-grid poster generation
