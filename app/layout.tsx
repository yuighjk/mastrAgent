import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mastra DeepSeek 聊天助手",
  description: "基于 Mastra.ai 和 DeepSeek 模型的中文聊天 Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
