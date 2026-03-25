# 数据模型 / Data Model

## 中文

### `users`

- `_id`：`openid` 或数据库生成的文档 ID
- `openid`：微信用户 openid
- `nickName`：用户昵称
- `avatarUrl`：头像地址
- `role`：`user` 或 `admin`
- `createdAt`：创建时间
- `lastLoginAt`：最近登录时间

### `walkRecords`

- `_id`
- `userId`
- `themeTitle`
- `themeSnapshot`
- `locationName`
- `locationContext`
- `routePoints`
- `missionsCompleted`
- `missionReviews`：AI 核验结果字典
- `photoList`
- `coverImage`
- `noteText`
- `isPublic`
- `walkMode`
- `generationSource`
- `createdAt`

### `walkThemes`

- `_id`
- `title`
- `description`
- `category`
- `missions`
- `vibeColor`
- `source`
- `status`
- `createdBy`
- `createdAt`

### 本次更新相关

与本轮功能更新最相关的字段是：

- `missionReviews`：用于保存每个任务的 AI 核验结果、评价语、置信信息和时间
- `walkMode`：用于区分纯粹模式与进阶模式
- `generationSource`：用于区分预设、AI、随机、组合、RAG fallback 等来源

---

## English

### `users`

- `_id`: `openid` or a generated document id
- `openid`: WeChat user openid
- `nickName`: user nickname
- `avatarUrl`: avatar URL
- `role`: `user` or `admin`
- `createdAt`: creation time
- `lastLoginAt`: latest login time

### `walkRecords`

- `_id`
- `userId`
- `themeTitle`
- `themeSnapshot`
- `locationName`
- `locationContext`
- `routePoints`
- `missionsCompleted`
- `missionReviews`: dictionary of AI verification results
- `photoList`
- `coverImage`
- `noteText`
- `isPublic`
- `walkMode`
- `generationSource`
- `createdAt`

### `walkThemes`

- `_id`
- `title`
- `description`
- `category`
- `missions`
- `vibeColor`
- `source`
- `status`
- `createdBy`
- `createdAt`

### Related to This Update

The most relevant fields added or emphasized in this iteration are:

- `missionReviews`: stores per-mission AI verification results, feedback text, confidence, and review time
- `walkMode`: distinguishes pure mode from advanced mode
- `generationSource`: distinguishes preset, AI, random, combined, and RAG fallback sources
