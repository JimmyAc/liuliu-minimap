# 遛遛小程序微信平台构建指南

本文档用于从零开始把 `liuliu-miniapp` 在微信平台上跑起来，并完成云开发、云函数、数据库、AI 配置与基础验收。

## 1. 项目目标

`遛遛` 是一个基于微信小程序的城市漫步应用，当前 MVP 包含以下能力：

- 地点选择与当前位置定位
- 基于 RAG 的 AI 漫步主题生成
- 任务打卡、图片记录、文字记录、轨迹记录
- 用户登录与资料同步
- 保存个人足迹
- 查看社区公开足迹

## 2. 项目结构

项目根目录：`liuliu-miniapp`

关键目录如下：

- `miniprogram/`：微信小程序前端代码
- `cloudfunctions/`：云函数代码
- `docs/`：部署和数据说明文档

当前核心云函数：

- `syncUser`
- `generateTheme`
- `getLocationContext`
- `createWalk`
- `listMyWalks`
- `listPublicWalks`

## 3. 准备工作

在开始前，请先准备：

- 一个可用的微信小程序 `AppID`
- 微信开发者工具
- Node.js LTS
- 阿里云 DashScope、DeepSeek 或其他兼容 OpenAI 接口的 AI Key

建议优先使用大陆更稳定的模型服务，例如：

- DashScope / 通义千问
- DeepSeek
- SiliconFlow

## 4. 导入项目到微信开发者工具

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择：`liuliu-miniapp`
4. 填写你自己的小程序 `AppID`。
5. 确认导入成功。

导入成功后，开发者工具会识别：

- 小程序根目录：`miniprogram/`
- 云函数目录：`cloudfunctions/`

## 5. 配置云环境 ID

打开文件：`miniprogram/utils/config.js`

将：

```js
module.exports = {
  cloudEnvId: 'your-cloud-env-id',
};
```

替换为你的真实云环境 ID，例如：

```js
module.exports = {
  cloudEnvId: 'cloud1-xxxxxxxxxxxx',
};
```

## 6. 开通微信云开发

1. 在微信开发者工具顶部或侧边栏进入 `云开发`。
2. 如果尚未开通，则先开通云开发。
3. 创建一个新的云环境。
4. 记下你的环境 ID。

后续数据库、云函数、存储都依赖这个云环境。

## 7. 安装云函数依赖

你需要为每个云函数安装依赖。

在项目根目录下执行：

```bash
npm.cmd --prefix cloudfunctions/generateTheme install
npm.cmd --prefix cloudfunctions/getLocationContext install
npm.cmd --prefix cloudfunctions/syncUser install
npm.cmd --prefix cloudfunctions/createWalk install
npm.cmd --prefix cloudfunctions/listMyWalks install
npm.cmd --prefix cloudfunctions/listPublicWalks install
```

如果你在 PowerShell 中遇到 `npm.ps1` 权限问题，请使用 `npm.cmd`。

安装完成后，每个云函数目录内应出现：

- `node_modules/`
- `package-lock.json`

## 8. 部署云函数

在微信开发者工具左侧资源管理器中展开 `cloudfunctions`，逐个右键执行：

- `上传并部署：云端安装依赖`

推荐部署顺序：

1. `syncUser`
2. `getLocationContext`
3. `generateTheme`
4. `createWalk`
5. `listMyWalks`
6. `listPublicWalks`

每次修改云函数代码或环境变量后，建议重新部署一次。

## 9. 创建数据库集合

在云开发的数据库面板中新建以下集合：

- `users`
- `walkRecords`
- `walkThemes`

权限类型建议选择：

- `仅创建者可读写`

原因：

- 当前主要通过云函数读写数据库
- 前端不直接开放数据库权限更安全

字段结构参考：`docs/data-model.md`

## 10. 配置 AI 环境变量

当前项目已改为使用大陆可较稳定直连的 OpenAI 兼容接口。

请为以下两个云函数配置环境变量：

- `generateTheme`
- `getLocationContext`

需要配置的变量：

- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_CHAT_MODEL`
- `AI_REQUEST_TIMEOUT_MS`（可选）
- `DEBUG_RAG_CONTEXT`（可选）

### 10.1 推荐配置：DashScope / 通义千问

```text
AI_API_KEY=你的阿里云 DashScope Key
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_CHAT_MODEL=qwen-turbo
AI_REQUEST_TIMEOUT_MS=1800
DEBUG_RAG_CONTEXT=false
```

说明：

- `qwen-turbo`：响应更快，适合云函数 3 秒限制场景
- `AI_REQUEST_TIMEOUT_MS`：用于提前失败并触发 fallback，避免整个云函数超时

### 10.2 备选配置：DeepSeek

```text
AI_API_KEY=你的 DeepSeek Key
AI_BASE_URL=https://api.deepseek.com/v1
AI_CHAT_MODEL=deepseek-chat
AI_REQUEST_TIMEOUT_MS=1800
DEBUG_RAG_CONTEXT=false
```

## 11. 小程序权限配置

当前小程序已在 `miniprogram/app.json` 中声明位置权限说明。

你在测试时仍需在微信环境中允许：

- 定位权限
- 相册/相机权限
- 用户资料权限

如果定位失败，请优先检查：

- 是否已授权定位
- 是否使用真机调试
- 是否在微信设置中关闭了位置信息权限

## 12. 运行与验证流程

建议按以下顺序进行验收。

### 12.1 测试登录

进入 `我的` 页：

- 点击 `微信登录并同步资料`

预期结果：

- 页面出现头像和昵称
- 数据库 `users` 集合出现一条用户数据

### 12.2 测试定位与选点

进入 `探索` 页：

- 点击 `使用当前位置`
- 点击 `手动选点`

预期结果：

- 页面成功更新地点名称
- 地点语境被更新

### 12.3 测试 AI 生成主题

在 `探索` 页依次设置：

- 心情
- 天气
- 季节
- 偏好
- 模式

然后点击：

- `AI 生成漫步主题`

预期结果：

- 主题标题变化
- 描述变化
- 任务列表变化

如果 AI 服务慢或暂时不可用，系统会走 `RAG fallback`，仍返回可用主题。

### 12.4 测试漫步记录

从探索页进入记录页后：

- 勾选任务
- 开启轨迹记录
- 选择一张图片
- 输入文字记录
- 选择是否公开
- 点击 `保存本次漫步`

预期结果：

- 提示保存成功
- 跳转到 `足迹` 页
- 数据库 `walkRecords` 集合出现新记录

### 12.5 测试足迹页

进入 `足迹` 页：

- 检查刚才保存的内容是否出现

预期结果：

- 主题标题正常显示
- 图片正常显示
- 文字正常显示
- 轨迹点数正常显示

### 12.6 测试社区页

如果保存时设置了公开，则进入 `社区` 页：

- 检查公开记录是否出现

预期结果：

- 能看到公开漫步记录

## 13. 常见问题排查

### 13.1 `npm` 无法执行

问题表现：

- PowerShell 中提示 `npm.ps1` 被禁止执行

解决方案：

- 使用 `npm.cmd`
- 或换用 CMD / Git Bash

### 13.2 云函数调用超时

问题表现：

- 日志中出现 `Invoking task timed out after 3 seconds`

原因：

- 外部 AI 接口返回过慢

解决方案：

- 使用更快的模型，如 `qwen-turbo`
- 设置 `AI_REQUEST_TIMEOUT_MS=1500~1800`
- 重新部署云函数

### 13.3 AI 生成结果总是很像

问题表现：

- 每次生成都相似，变化不大

原因：

- 当前返回的是 `rag-fallback`
- 外部 AI 请求没有及时返回

解决方案：

- 检查云函数日志中的 `source`
- 确保 `AI_API_KEY` 正确
- 确保 `AI_BASE_URL` 正确
- 重新部署 `generateTheme`

### 13.4 定位失败 / 选点失败

优先检查：

- 小程序是否已授权定位
- 真机是否允许定位
- 是否在模拟器环境中调用受限能力

### 13.5 登录成功但数据库没有数据

优先检查：

- `syncUser` 是否部署成功
- 当前云环境是否正确
- 数据库集合 `users` 是否已创建

### 13.6 历史页和社区页为空

优先检查：

- `listMyWalks` 和 `listPublicWalks` 是否部署成功
- `walkRecords` 是否已有数据
- 保存记录时是否勾选公开

## 14. 当前 AI 与 RAG 机制说明

当前主题生成逻辑不是纯随机，也不是只靠大模型裸生成，而是：

1. 根据地点、偏好、天气、心情等做本地 RAG 检索
2. 检索场景画像与任务模板
3. 将检索结果拼进提示词
4. 调用外部 AI 生成
5. 如果 AI 太慢或失败，则快速退回本地 RAG fallback

这样设计的好处是：

- 即使外部模型响应慢，也不会完全卡住
- fallback 仍然能输出可用任务
- 任务更贴近地点和语境

## 15. 当前 MVP 已实现范围

已实现：

- 微信登录与用户同步
- 定位与手动选点
- 基于 RAG 的 AI 主题生成
- 图片与文字记录
- 漫步轨迹记录
- 足迹保存
- 社区展示

暂未实现：

- 音频记录
- 视频记录
- 社区投稿审核
- 九宫格海报生成
- 后台管理系统

## 16. 建议的最终验收清单

全部完成后，你至少应确认以下项目：

- 能进入小程序首页
- 能成功登录
- 能成功定位
- 能成功手动选点
- 能成功生成多个不同主题
- 能进入记录页
- 能保存图片和文字记录
- 能写入 `walkRecords`
- 足迹页可正常显示
- 社区页可正常显示公开记录

## 17. 相关文档

- `README.md`
- `docs/cloudbase-env.md`
- `docs/data-model.md`
- `docs/rag-notes.md`

如果后续要进入下一阶段开发，建议优先做：

1. 前端显示当前生成结果来源（AI / RAG fallback）
2. 图片上传失败提示优化
3. 音频和视频记录
4. 社区内容审核机制
