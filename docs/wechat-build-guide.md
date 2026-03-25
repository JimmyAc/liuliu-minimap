# 遛遛小程序微信平台构建指南 / WeChat Platform Build Guide

## 中文

本文档说明如何从零开始将 `liuliu-miniapp` 在微信平台上跑起来，并完成云开发、云函数、数据库、AI 配置与基础验收。

### 1. 项目目标

`遛遛` 是一个基于微信小程序的城市漫步应用，当前 MVP 包含：

- 地点选择与当前位置定位
- 基于 RAG 的 AI 漫步主题生成
- 任务打卡、图片记录、文字记录、轨迹记录
- 用户登录与资料同步
- 保存个人足迹
- 查看社区公开足迹

### 2. 项目结构

项目根目录为 `liuliu-miniapp`，关键目录如下：

- `miniprogram/`：微信小程序前端代码
- `cloudfunctions/`：云函数代码
- `docs/`：部署和数据文档

当前核心云函数包括：

- `syncUser`
- `generateTheme`
- `getLocationContext`
- `createWalk`
- `listMyWalks`
- `listPublicWalks`
- `generateRandomTheme`
- `generateCombinedTheme`
- `verifyMission`
- `getWalkDetail`

### 3. 准备工作

开始前请准备：

- 可用的小程序 `AppID`
- 微信开发者工具
- Node.js LTS
- 中国大陆可访问的 AI Key，例如 DashScope、DeepSeek 或其他 OpenAI 兼容服务

### 4. 导入项目

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 目录选择 `liuliu-miniapp`。
4. 填写真实小程序 `AppID`。
5. 确认导入成功。

导入后应识别：

- 小程序根目录：`miniprogram/`
- 云函数目录：`cloudfunctions/`

### 5. 配置云环境 ID

打开 `miniprogram/utils/config.js`，将 `cloudEnvId` 替换为真实环境 ID。

### 6. 开通微信云开发

1. 在微信开发者工具中进入 `云开发`。
2. 如果尚未开通，则先开通。
3. 创建新的云环境。
4. 记下环境 ID。

### 7. 安装云函数依赖

在项目根目录执行：

```bash
npm.cmd --prefix cloudfunctions/generateTheme install
npm.cmd --prefix cloudfunctions/getLocationContext install
npm.cmd --prefix cloudfunctions/syncUser install
npm.cmd --prefix cloudfunctions/createWalk install
npm.cmd --prefix cloudfunctions/listMyWalks install
npm.cmd --prefix cloudfunctions/listPublicWalks install
npm.cmd --prefix cloudfunctions/generateRandomTheme install
npm.cmd --prefix cloudfunctions/generateCombinedTheme install
npm.cmd --prefix cloudfunctions/verifyMission install
npm.cmd --prefix cloudfunctions/getWalkDetail install
```

如果 PowerShell 遇到 `npm.ps1` 权限问题，请使用 `npm.cmd`。

### 8. 部署云函数

在资源管理器中展开 `cloudfunctions`，逐个右键执行：

- `上传并部署：云端安装依赖`

推荐部署顺序：

1. `syncUser`
2. `getLocationContext`
3. `generateTheme`
4. `generateRandomTheme`
5. `generateCombinedTheme`
6. `verifyMission`
7. `createWalk`
8. `listMyWalks`
9. `listPublicWalks`
10. `getWalkDetail`

每次修改云函数代码或环境变量后，建议重新部署。

### 9. 创建数据库集合

在云开发数据库中新建：

- `users`
- `walkRecords`
- `walkThemes`

建议权限类型：

- `仅创建者可读写`

### 10. 配置 AI 环境变量

请为 `generateTheme`、`getLocationContext`、`generateRandomTheme`、`generateCombinedTheme`、`verifyMission` 配置环境变量：

- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_CHAT_MODEL`
- `AI_REQUEST_TIMEOUT_MS`
- `DEBUG_RAG_CONTEXT`

DashScope 推荐配置：

```text
AI_API_KEY=你的 DashScope Key
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_CHAT_MODEL=qwen-turbo
AI_REQUEST_TIMEOUT_MS=1800
DEBUG_RAG_CONTEXT=false
```

DeepSeek 推荐配置：

```text
AI_API_KEY=你的 DeepSeek Key
AI_BASE_URL=https://api.deepseek.com/v1
AI_CHAT_MODEL=deepseek-chat
AI_REQUEST_TIMEOUT_MS=1800
DEBUG_RAG_CONTEXT=false
```

### 11. 小程序权限

测试时应允许：

- 定位权限
- 相册 / 相机权限
- 用户资料权限

如果定位失败，优先检查：

- 是否已授权定位
- 是否使用真机调试
- 是否在微信设置中关闭位置信息权限

### 12. 验收流程

建议按以下顺序测试：

1. `我的` 页登录并检查 `users`
2. `探索` 页测试定位与手动选点
3. 测试 AI 生成主题
4. 测试随机主题与组合主题
5. 进入记录页，测试多图上传与 AI 任务核验
6. 保存足迹并检查 `walkRecords`
7. 检查 `足迹` 页列表与详情
8. 检查 `社区` 页列表与详情

### 13. 常见问题

#### 13.1 `npm` 无法执行

- 使用 `npm.cmd`
- 或切换到 CMD / Git Bash

#### 13.2 云函数超时

- 使用更快模型，如 `qwen-turbo`
- 配置 `AI_REQUEST_TIMEOUT_MS=1500~1800`
- 重新部署云函数

#### 13.3 AI 结果总是很像

- 检查是否持续命中 `rag-fallback`
- 检查 `AI_API_KEY`、`AI_BASE_URL` 与模型名
- 重新部署相关云函数

#### 13.4 当前位置语境不准确

- 当前已优先尝试通过逆地理解析补全地点名
- 若仍不准确，优先用手动选点测试

#### 13.5 足迹列表能看到但无详情

- 确认 `getWalkDetail` 已部署
- 确认列表卡片点击可正常跳转

#### 13.6 任务无法 AI 核验

- 确认 `verifyMission` 已部署
- 确认图片已上传到云存储
- 确认 AI 提供方支持图像输入

### 14. 当前能力范围

已实现：

- 微信登录与资料同步
- 定位与手动选点
- AI / RAG 主题生成
- 随机主题与组合主题
- 多图上传
- 任务 AI 图文核验
- 足迹保存
- 足迹 / 社区详情页

后续再做：

- 音频 / 视频记录
- 社区审核
- 海报导出
- 管理后台

---

## English

This document explains how to run `liuliu-miniapp` on the WeChat platform from scratch, including cloud development, cloud functions, database setup, AI configuration, and basic validation.

### 1. Project Goal

`liuliu` is a city-walk Mini Program MVP that currently includes:

- location picking and current-location support
- RAG-based AI walk theme generation
- mission check-in, photo capture, notes, and route tracking
- user login and profile sync
- personal walk saving
- public community feed browsing

### 2. Project Structure

The project root is `liuliu-miniapp`, with these key directories:

- `miniprogram/`: WeChat Mini Program frontend code
- `cloudfunctions/`: cloud function code
- `docs/`: deployment and data documents

The current core cloud functions are:

- `syncUser`
- `generateTheme`
- `getLocationContext`
- `createWalk`
- `listMyWalks`
- `listPublicWalks`
- `generateRandomTheme`
- `generateCombinedTheme`
- `verifyMission`
- `getWalkDetail`

### 3. Prerequisites

Prepare the following before you start:

- a valid Mini Program `AppID`
- WeChat DevTools
- Node.js LTS
- an AI key that is accessible from mainland China, such as DashScope, DeepSeek, or another OpenAI-compatible provider

### 4. Import the Project

1. Open WeChat DevTools.
2. Choose “Import Project”.
3. Select the `liuliu-miniapp` directory.
4. Fill in the real Mini Program `AppID`.
5. Confirm that the import succeeds.

After import, DevTools should detect:

- Mini Program root: `miniprogram/`
- cloud function root: `cloudfunctions/`

### 5. Configure the Cloud Environment ID

Open `miniprogram/utils/config.js` and replace `cloudEnvId` with the real environment ID.

### 6. Enable WeChat Cloud Development

1. Open `Cloud Development` in WeChat DevTools.
2. Enable it if it is not already enabled.
3. Create a new cloud environment.
4. Keep a record of the environment ID.

### 7. Install Cloud Function Dependencies

Run the following in the project root:

```bash
npm.cmd --prefix cloudfunctions/generateTheme install
npm.cmd --prefix cloudfunctions/getLocationContext install
npm.cmd --prefix cloudfunctions/syncUser install
npm.cmd --prefix cloudfunctions/createWalk install
npm.cmd --prefix cloudfunctions/listMyWalks install
npm.cmd --prefix cloudfunctions/listPublicWalks install
npm.cmd --prefix cloudfunctions/generateRandomTheme install
npm.cmd --prefix cloudfunctions/generateCombinedTheme install
npm.cmd --prefix cloudfunctions/verifyMission install
npm.cmd --prefix cloudfunctions/getWalkDetail install
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` instead.

### 8. Deploy Cloud Functions

In the file tree, expand `cloudfunctions` and for each function run:

- `Upload and Deploy: Install Dependencies Online`

Recommended deployment order:

1. `syncUser`
2. `getLocationContext`
3. `generateTheme`
4. `generateRandomTheme`
5. `generateCombinedTheme`
6. `verifyMission`
7. `createWalk`
8. `listMyWalks`
9. `listPublicWalks`
10. `getWalkDetail`

Redeploy whenever cloud function code or environment variables change.

### 9. Create Database Collections

Create these collections in the cloud database:

- `users`
- `walkRecords`
- `walkThemes`

Recommended permission type:

- `creator read/write only`

### 10. Configure AI Environment Variables

Set the following environment variables for `generateTheme`, `getLocationContext`, `generateRandomTheme`, `generateCombinedTheme`, and `verifyMission`:

- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_CHAT_MODEL`
- `AI_REQUEST_TIMEOUT_MS`
- `DEBUG_RAG_CONTEXT`

Recommended DashScope setup:

```text
AI_API_KEY=your DashScope key
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_CHAT_MODEL=qwen-turbo
AI_REQUEST_TIMEOUT_MS=1800
DEBUG_RAG_CONTEXT=false
```

Recommended DeepSeek setup:

```text
AI_API_KEY=your DeepSeek key
AI_BASE_URL=https://api.deepseek.com/v1
AI_CHAT_MODEL=deepseek-chat
AI_REQUEST_TIMEOUT_MS=1800
DEBUG_RAG_CONTEXT=false
```

### 11. Mini Program Permissions

Allow these permissions during testing:

- location
- album / camera
- user profile access

If location fails, check:

- whether location permission has been granted
- whether you are using real-device debugging
- whether location has been disabled in WeChat settings

### 12. Validation Flow

Test in this order:

1. login on the `Profile` page and confirm `users`
2. test current location and manual picking on the `Explore` page
3. test AI theme generation
4. test random theme and combined theme generation
5. enter the record page and test multi-image upload and AI mission verification
6. save a walk and confirm `walkRecords`
7. check the `History` list and detail page
8. check the `Community` list and detail page

### 13. Common Issues

#### 13.1 `npm` cannot run

- use `npm.cmd`
- or switch to CMD / Git Bash

#### 13.2 cloud function timeout

- use a faster model such as `qwen-turbo`
- set `AI_REQUEST_TIMEOUT_MS=1500~1800`
- redeploy the function

#### 13.3 AI output looks too similar

- check whether it keeps falling back to `rag-fallback`
- verify `AI_API_KEY`, `AI_BASE_URL`, and the model name
- redeploy the related functions

#### 13.4 current-location context looks inaccurate

- the current implementation already tries reverse geocoding first to infer a more specific place name
- if it is still inaccurate, test manual location picking first

#### 13.5 history list works but detail is missing

- confirm `getWalkDetail` is deployed
- confirm the card click navigates correctly

#### 13.6 mission AI verification does not work

- confirm `verifyMission` is deployed
- confirm images have been uploaded to cloud storage
- confirm the AI provider supports image input

### 14. Current Feature Scope

Implemented:

- WeChat login and profile sync
- current location and manual picking
- AI / RAG theme generation
- random theme and combined theme generation
- multi-image upload
- AI-assisted mission verification with image + text
- walk saving
- history / community detail pages

Planned for later:

- audio / video recording
- community moderation
- poster export
- admin backend
