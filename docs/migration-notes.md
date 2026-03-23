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
- theme generation now uses a lightweight RAG layer with local scene profiles and mission templates

## Current RAG Design

- retrieval source 1: built-in scene profiles such as old streets, commercial districts, parks, campuses, and markets
- retrieval source 2: built-in mission template library for color, texture, shape, sound, and city observation tasks
- retrieval signal: location name, location context, user preference, mood, weather, and season
- generation path: retrieve relevant context first, then call Gemini with grounded prompt, then fall back to retrieved templates if needed

Deferred to phase 2:
- audio/video recording
- combined theme generation
- custom theme submission and moderation
- nine-grid poster generation
