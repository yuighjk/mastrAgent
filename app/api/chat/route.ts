import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ChatMessage } from "@src/types/chat";

type CloudflareBindings = Record<string, string | undefined>;

const getCfBindings = (): CloudflareBindings => {
  try {
    return (getCloudflareContext().env as CloudflareBindings) ?? {};
  } catch {
    // getCloudflareContext 在本地构建或 CLI 中可能不可用
    return {};
  }
};

const getEnv = (name: string): string | undefined => {
  return process.env[name] ?? getCfBindings()[name];
};

const getDeepseekConfig = () => ({
  apiKey: getEnv("DEEPSEEK_API_KEY"),
  baseUrl: getEnv("DEEPSEEK_API_BASE") ?? "https://api.deepseek.com/v1",
  model: getEnv("DEEPSEEK_MODEL") ?? "deepseek-chat",
  temperature: Number(getEnv("DEEPSEEK_TEMPERATURE") ?? 0.7),
  maxTokens: Number(getEnv("DEEPSEEK_MAX_TOKENS") ?? 800),
});

type ChatPayload = {
  messages?: Array<Pick<ChatMessage, "id" | "role" | "content">>;
};

type DeepseekChoice = {
  message?: { content?: string };
};

type DeepseekResponse = {
  choices?: DeepseekChoice[];
};

async function generateAnswer(history: ChatMessage[]) {
  const { apiKey, baseUrl, model, temperature, maxTokens } =
    getDeepseekConfig();
  if (!apiKey) {
    throw new Error("缺少 DEEPSEEK_API_KEY");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: history,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Deepseek API 请求失败（${response.status}）：${errorText}`,
    );
  }

  const data = (await response.json()) as DeepseekResponse;
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Deepseek API 未返回有效内容");
  }

  return text;
}

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

    if (!getDeepseekConfig().apiKey) {
      return NextResponse.json(
        { error: "缺少 DEEPSEEK_API_KEY，请先在 .env 中配置。" },
        { status: 500 },
      );
    }

    const history = payload as ChatMessage[];
    const answer = await generateAnswer(history);

    return NextResponse.json({
      message: {
        id: `assistant-${crypto.randomUUID()}`,
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
