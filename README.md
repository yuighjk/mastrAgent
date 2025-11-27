## Mastra + DeepSeek 聊天 Agent

一个基于 [Mastra.ai](https://mastra.ai) 框架与 DeepSeek 模型的中文聊天站点，同时保留命令行调试入口，方便在浏览器和终端两种形态下测试 Agent。

### 快速开始

1. 在项目根目录的 `.env` 中配置 DeepSeek 的 key：

   ```bash
   DEEPSEEK_API_KEY=sk-xxxx
   # 可选：覆盖默认模型与 Base URL
   # DEEPSEEK_MODEL=deepseek-chat
   # DEEPSEEK_API_BASE=https://api.deepseek.com/v1
   ```

2. 安装依赖并启动 Next.js 开发服务器：

   ```bash
   npm install
   npm run dev
   ```

3. 打开浏览器访问 `http://localhost:3000` 即可体验网页聊天界面。

### 其他脚本

- `npm run chat`：使用命令行界面与同一个 Mastra Agent 对话，便于快速调试模型回复。
- `npm run build && npm run start`：构建并以生产模式运行 Next.js 应用。

### 项目结构

- `src/agents`：Mastra Agent 的配置，统一在 `chatAgent.ts` 中声明模型、提示词等。
- `src/mastra.ts`：Mastra 容器实例，可在 API 路由或 CLI 中直接复用。
- `app/`：Next.js App Router 入口，包含 `/api/chat` 服务端路由与聊天页面。

### 注意事项

- 未配置 `DEEPSEEK_API_KEY` 时，网页 API 会直接返回错误提示，以避免静默失败。
- 所有聊天上下文都在浏览器内维护，API 仅负责根据 Mastra Agent 生成最新的回复。
