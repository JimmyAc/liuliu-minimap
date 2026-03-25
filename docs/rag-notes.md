# RAG 说明 / RAG Notes

## 中文

当前实现采用轻量 RAG，而不是向量数据库方案。

### 为什么使用这一版

- 更适合 MVP 快速上线
- 避免前端暴露 AI Key
- 相比直接 prompt 生成，能得到更贴地点的任务
- 即使 AI 服务不可用，也仍能返回可用主题
- 兼容中国大陆更友好的 OpenAI 兼容模型服务

### 检索资产

- `cloudfunctions/generateTheme/knowledge.js`
  - 场景画像
  - 任务模板库
  - 偏好偏置表
- `cloudfunctions/generateTheme/rag.js`
  - 关键词检索
  - 类别选择
  - fallback 主题构建
  - grounded prompt 构建

### 本次更新相关

本轮更新在原有 RAG 基础上补了两点：

- fallback 输出增加了随机化处理，减少“每次都差不多”的感觉
- 新增随机主题、组合主题和任务核验等能力时，整体仍延续“先结构约束、再调用 AI”的思路

### 后续升级方向

下一阶段可以在此基础上继续扩展：

- 接入地图 POI 检索
- 将审核通过的社区发现作为检索语料
- 引入 embedding 与向量检索
- 基于用户历史做个性化召回

---

## English

The current implementation uses a lightweight RAG strategy instead of a vector-database-based approach.

### Why This Version

- It is better suited for a fast MVP launch
- It avoids exposing AI keys in the frontend
- It produces more grounded tasks than direct prompt-only generation
- It still returns usable themes even when the AI provider is unavailable
- It works well with mainland-friendly OpenAI-compatible model providers

### Retrieval Assets

- `cloudfunctions/generateTheme/knowledge.js`
  - scene profiles
  - mission template library
  - preference bias table
- `cloudfunctions/generateTheme/rag.js`
  - keyword retrieval
  - category selection
  - fallback theme building
  - grounded prompt building

### Related to This Update

This iteration extends the previous RAG setup in two important ways:

- the fallback output is now more randomized, reducing the feeling that every result looks the same
- the newly added random theme, combined theme, and mission verification flows still follow the same idea of using structured constraints before calling AI

### Upgrade Path

In the next phase, this can be extended with:

- map POI retrieval
- approved community discoveries as part of the retrieval corpus
- embeddings and vector search
- personalized retrieval based on user history
