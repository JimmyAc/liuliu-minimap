# Data Model

## `users`
- `_id`: openid or generated document id
- `openid`: WeChat openid
- `nickName`: user nickname
- `avatarUrl`: profile image
- `role`: `user` or `admin`
- `createdAt`
- `lastLoginAt`

## `walkRecords`
- `_id`
- `userId`
- `themeTitle`
- `themeSnapshot`
- `locationName`
- `locationContext`
- `routePoints`
- `missionsCompleted`
- `photoList`
- `coverImage`
- `noteText`
- `isPublic`
- `createdAt`

## `walkThemes`
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
