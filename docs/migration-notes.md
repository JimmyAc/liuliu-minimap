# 迁移说明 / Migration Notes

## 中文

当前小程序保留了 `liuliu` 网页版的核心产品逻辑：

- AI 生成城市漫步主题
- 与地点语境相关的探索
- 漫步记录保存
- 社区内容流

小程序 MVP 相比网页版的主要变化：

- React Web 界面改为原生微信小程序页面
- Firebase 改为微信云数据库与云存储
- 浏览器定位 / 媒体 API 改为微信小程序 API
- AI 调用从前端迁移到云函数
- 主题生成加入了轻量 RAG 层和大陆可达的 OpenAI 兼容接口

### 当前 RAG 设计

- 检索源 1：内置场景画像，如老街、商业区、公园、校园、市场等
- 检索源 2：内置任务模板库，覆盖色彩、纹理、形状、声音、城市观察等
- 检索信号：地点名称、地点语境、用户偏好、心情、天气、季节
- 生成路径：先检索相关上下文，再调用 AI 生成；若超时或失败则回退到本地模板

### 本次更新相关

本轮迁移补上了若干此前在网页 demo 中存在、但小程序 MVP 尚未完整实现的能力：

- 恢复首页展示栏
- 恢复随机主题与组合主题
- 增加足迹详情页
- 增加多图上传
- 增加任务 AI 图文核验
- 优化当前位置语境识别

### 延后到下一阶段

- 音频 / 视频记录
- 社区投稿与审核
- 九宫格海报导出
- 后台管理端

---

## English

The current Mini Program keeps the core product logic from the `liuliu` web version:

- AI-generated city walk themes
- exploration grounded in location context
- walk record saving
- community feed

The main MVP changes from the web version are:

- the React web UI is replaced with native WeChat Mini Program pages
- Firebase is replaced with WeChat cloud database and cloud storage
- browser geolocation and media APIs are replaced with WeChat APIs
- AI calls move from the frontend to cloud functions
- theme generation now includes a lightweight RAG layer and a mainland-accessible OpenAI-compatible provider

### Current RAG Design

- Retrieval source 1: built-in scene profiles such as old streets, commercial districts, parks, campuses, and markets
- Retrieval source 2: built-in mission template library covering color, texture, shape, sound, and city observation
- Retrieval signals: location name, location context, user preference, mood, weather, and season
- Generation path: retrieve relevant context first, then call the AI provider; if the call times out or fails, fall back to local templates

### Related to This Update

This iteration restores several capabilities that existed in the original web demo but were not yet fully implemented in the Mini Program MVP:

- restored the homepage display bar
- restored random theme and combined theme generation
- added a walk detail page
- added multi-image upload
- added AI-assisted mission verification using image + text
- improved current-location context recognition

### Deferred to the Next Phase

- audio/video recording
- community submission and moderation
- nine-grid poster export
- admin backend
