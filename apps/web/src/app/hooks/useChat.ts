import { useCallback, useRef, useState } from "react";
import { buildApiUrl } from "../lib/api-base";

export type Message = {
    role: "user" | "assistant";
    content: string;
};

export const WELCOME_MESSAGE: Message = {
    role: "assistant",
    content:
        "你好，我是星点评 AI 导购助手。告诉我你的任务，我会给你推荐工具组合、适合原因、风险提醒和使用流程。",
};

export const QUICK_QUESTIONS = [
    "帮我找论文排版工具",
    "推荐适合做 PPT 的 AI",
    "有哪些免费好用的 AI 工具",
    "帮我对比几款 AI 写作工具",
];

export async function buildChatRequestError(response: Response): Promise<Error> {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? JSON.stringify(await response.json()) : await response.text();
    const detail = payload.trim().slice(0, 300);
    const message = detail
        ? `Chat request failed with status ${response.status}: ${detail}`
        : `Chat request failed with status ${response.status}`;
    return new Error(message);
}

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
        });
    }, []);

    const handleReset = useCallback(() => {
        setMessages([WELCOME_MESSAGE]);
        setInput("");
        setIsLoading(false);
    }, []);

    const showQuickQuestions = messages.length === 1 && messages[0].role === "assistant" && !isLoading;

    const handleSend = async (overrideText?: string) => {
        const text = (overrideText || input).trim();
        if (!text || isLoading) return;

        const userMessage: Message = { role: "user", content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(buildApiUrl("/api/chat"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })) }),
            });

            if (!response.ok) {
                throw await buildChatRequestError(response);
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            let buffer = "";
            let fullAssistantText = "";
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (!value) continue;

                buffer += decoder.decode(value, { stream: true });

                const parts = buffer.split("\n\n");
                buffer = parts.pop() || "";

                for (const part of parts) {
                    const line = part.trim();
                    if (!line.startsWith("data: ")) continue;

                    const dataStr = line.slice(6);
                    if (dataStr === "[DONE]") {
                        done = true;
                        break;
                    }

                    try {
                        const payload = JSON.parse(dataStr);

                        if (payload.error) {
                            const errorMessage = `> 系统提示：${payload.error}`;
                            setMessages((prev) => {
                                const updated = [...prev];
                                const lastIdx = updated.length - 1;
                                if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                                    updated[lastIdx] = { ...updated[lastIdx], content: errorMessage };
                                }
                                return updated;
                            });
                            done = true;
                            break;
                        }

                        if (payload.content) {
                            fullAssistantText += payload.content;
                            const nextText = fullAssistantText;
                            setMessages((prev) => {
                                const updated = [...prev];
                                const lastIdx = updated.length - 1;
                                if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                                    updated[lastIdx] = { ...updated[lastIdx], content: nextText };
                                }
                                return updated;
                            });
                        }
                    } catch {
                        continue;
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "> 系统提示：网络请求异常，请稍后重试" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        containerRef,
        showQuickQuestions,
        scrollToBottom,
        handleReset,
        handleSend,
    };
}
