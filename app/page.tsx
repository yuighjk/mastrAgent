"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessage, ChatRole } from "@src/types/chat";

type AuthorRole = Exclude<ChatRole, "system">;

const createMessage = (role: AuthorRole, content: string): ChatMessage => {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return { id: `${role}-${uuid}`, role, content };
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const question = input.trim();
      if (!question || loading) {
        return;
      }

      const nextMessages = [...messages, createMessage("user", question)];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "服务暂时不可用");
        }

        const data = (await response.json()) as { message: ChatMessage };
        setMessages([...nextMessages, data.message]);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "发送失败，请稍后重试。",
        );
        setMessages(messages);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, messages],
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }, []);

  const helperText = useMemo(() => {
    if (error) {
      return error;
    }
    if (loading) {
      return "DeepSeek 正在思考，请稍候…";
    }
    return "按 Enter 发送，Shift+Enter 换行。";
  }, [error, loading]);

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <div className="header-info">
            <div className="avatar">M</div>
            <div>
              <h1 style={{ margin: 0 }}>Mastra DeepSeek Agent</h1>
              <p className="status">
                基于 Mastra.ai + DeepSeek API，专注中文对话与 Mastra 知识问答。
              </p>
            </div>
          </div>
          <span className="badge">实时对话</span>
        </header>

        <section className="chat-area">
          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>开始你的第一句提问，例如：</p>
                <p>“帮助我快速了解 Mastra 框架的核心能力”</p>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className="message"
                  data-role={message.role}
                >
                  <div className={`avatar ${message.role === "user" ? "user" : ""}`}>
                    {message.role === "user" ? "你" : "M"}
                  </div>
                  <div className={`bubble ${message.role}`}>
                    {message.content}
                  </div>
                </article>
              ))
            )}
            <div ref={messageEndRef} />
          </div>
        </section>

        <form className="input-panel" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="prompt-input"
            placeholder="想聊点什么？例如让助手解释 Mastra 的工作流、工具调用或构建 Agent 的步骤。"
            value={input}
            minLength={1}
            rows={3}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            disabled={loading}
          />

          <div className="action-row">
            <span className="notification">{helperText}</span>
            <div className="actions">
              <button
                type="button"
                className="button secondary"
                onClick={clearConversation}
                disabled={loading || messages.length === 0}
              >
                清空
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={loading || !input.trim()}
              >
                {loading ? "发送中…" : "发送"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
