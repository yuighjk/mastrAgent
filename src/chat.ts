import "dotenv/config";
import { randomUUID } from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { mastra } from "./mastra";
import type { ChatMessage } from "./types/chat";

const createMessage = (
  role: "user" | "assistant",
  content: string,
): ChatMessage => ({
  id: `${role}-${randomUUID()}`,
  role,
  content,
});

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("❌ 缺少 DEEPSEEK_API_KEY，请在 .env 中配置后再试。");
    process.exitCode = 1;
    return;
  }

  const agent = mastra.getAgent("chatAgent");
  const rl = readline.createInterface({ input, output });
  const history: ChatMessage[] = [];

  console.log("💬 Mastra 中文聊天助手，输入 exit 结束对话。\n");

  while (true) {
    const question = (await rl.question("你：")).trim();

    if (!question) {
      continue;
    }

    if (["exit", "quit", "q"].includes(question.toLowerCase())) {
      break;
    }

    history.push(createMessage("user", question));

    try {
      const response = await agent.generate(history, {
        providerOptions: {
          openai: { temperature: 0.7 },
        },
      });

      const answer = response.text?.trim() ?? "（模型未返回文字内容）";
      console.log(`代理：${answer}\n`);

      history.push(createMessage("assistant", answer));
    } catch (error) {
      console.error("生成回答失败：", error);
      history.pop(); // 回退最近的 user 消息，防止无效轮次进入上下文
    }
  }

  rl.close();
  console.log("会话结束，再见！👋");
}

main().catch((error) => {
  console.error("启动聊天出错：", error);
  process.exitCode = 1;
});
