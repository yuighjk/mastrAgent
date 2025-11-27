import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { mastra } from "@src/mastra";
import type { ChatMessage } from "@src/types/chat";

type ChatPayload = {
  messages?: Array<Pick<ChatMessage, "id" | "role" | "content">>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatPayload;
    const payload = body.messages?.filter(
      (message) =>
        message.role === "user" ||
        message.role === "assistant" ||
        message.role === "system",
    );

    if (!payload || payload.length === 0) {
      return NextResponse.json(
        { error: "请输入问题或提供上下文。" },
        { status: 400 },
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "缺少 DEEPSEEK_API_KEY，请先在 .env 中配置。" },
        { status: 500 },
      );
    }

    const agent = mastra.getAgent("chatAgent");
    const history = payload as ChatMessage[];

    const response = await agent.generate(history, {
      providerOptions: {
        openai: { temperature: 0.7, maxTokens: 800 },
      },
    });

    const answer =
      response.text?.trim() ?? "抱歉，暂时没有生成有效的回答。";

    return NextResponse.json({
      message: {
        id: `assistant-${randomUUID()}`,
        role: "assistant",
        content: answer,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "服务暂时不可用，请稍后再试。" },
      { status: 500 },
    );
  }
}
