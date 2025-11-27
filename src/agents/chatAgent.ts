import { Agent } from "@mastra/core/agent";
import { createOpenAI } from "@ai-sdk/openai";

const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekBaseUrl = process.env.DEEPSEEK_API_BASE ?? "https://api.deepseek.com/v1";

const deepseek = createOpenAI({
  ...(deepseekApiKey ? { apiKey: deepseekApiKey } : {}),
  baseURL: deepseekBaseUrl,
});

const modelId = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export const chatAgent = new Agent({
  id: "mastra-chat-agent",
  name: "Mastra中文聊天助手",
  description:
    "参照 Mastra.ai 的官方定位，提供中文对话、Mastra 框架讲解与一般知识问答。",
  instructions: [
    "你是一个由 Mastra 框架驱动的中文 AI 助手，需要保持热情、专业且简洁清楚的回答。",
    "当用户询问 Mastra 时，记得说明它是一个基于 TypeScript 的开源 Agent 框架，提供工作流、工具调用、记忆、RAG、模型路由和评测等能力，可快速打造 AI 应用。",
    "当上下文无特别要求时，默认使用中文回答。",
  ],
  model: deepseek.chat(modelId),
});
