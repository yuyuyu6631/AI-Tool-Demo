"use client";

import React, { useEffect } from "react";
import { useChat, QUICK_QUESTIONS, Message } from "../../hooks/useChat";
import { AssistantMessage } from "./AssistantMessage";

export default function InlineChatBot() {
    const {
        messages,
        input,
        setInput,
        isLoading,
        containerRef,
        showQuickQuestions,
        scrollToBottom,
        handleSend
    } = useChat();

    // 内嵌组件默认展开，消息变化时自动滚动
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    return (
        <div className="flex h-full min-h-[460px] max-h-[600px] w-full flex-col overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-glass)] backdrop-blur-md">
            {/* ── 内嵌态简易 Header (可选) ── */}
            <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-surface-strong)] px-5 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[10px] font-bold text-[var(--color-primary)]">
                        AI
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-tight text-[var(--text-primary)]">不知道用什么？</h3>
                        <p className="text-[10px] text-[var(--text-tertiary)]">让智能导购帮你缩小范围</p>
                    </div>
                </div>
            </div>

            {/* ── Messages ── */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-behavior-contain"
                style={{ overscrollBehavior: 'contain' }}
            >
                {messages.map((msg: Message, idx: number) => (
                    <div
                        key={idx}
                        className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <div
                            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium mt-0.5 ${msg.role === "user"
                                ? "bg-[var(--color-primary)] text-[#0B1020]"
                                : "border border-[var(--color-primary-border)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                }`}
                        >
                            {msg.role === "user" ? "我" : "AI"}
                        </div>
                        <div
                            className={`message-bubble max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words shadow-sm ${msg.role === "user"
                                ? "bg-[var(--color-primary)] text-[#0B1020] rounded-tr-sm"
                                : "border border-[var(--border-default)] bg-[var(--bg-surface-strong)] text-[var(--text-secondary)] rounded-tl-sm"
                                }`}
                        >
                            {msg.role === "assistant" ? (
                                <AssistantMessage content={msg.content || "…"} />
                            ) : (
                                <span className="whitespace-pre-wrap">{msg.content}</span>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-2.5 flex-row">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-soft)] text-[11px] font-medium text-[var(--color-primary)]">
                            AI
                        </div>
                        <div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-tl-sm border border-[var(--border-default)] bg-[var(--bg-surface-strong)] px-3.5 py-2.5 text-[13px]">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-primary)]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-primary)]" style={{ animationDelay: "0.15s" }} />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-primary)]" style={{ animationDelay: "0.3s" }} />
                            <span className="ml-1.5 text-xs text-slate-400">正在思考…</span>
                        </div>
                    </div>
                )}

                {showQuickQuestions && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {QUICK_QUESTIONS.map((q: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(q)}
                                className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-strong)] px-3 py-1.5 text-[11px] text-[var(--text-tertiary)] transition-all duration-200 hover:border-[var(--color-primary-border)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* 已经使用 containerRef 滚动，不再使用 dummy div */}
            </div>

            {/* ── Input Area ── */}
            <div className="border-t border-[var(--border-default)] bg-[var(--bg-surface-strong)] p-3">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-1 transition-all focus-within:border-[var(--border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-primary-soft)]">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={isLoading}
                        placeholder="用一句话描述你想做的事..."
                        className="flex-1 border-none bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="rounded-lg bg-[var(--color-primary)] p-2 text-[#0B1020] transition-colors hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--bg-surface-hover)] disabled:text-[var(--text-disabled)]"
                        aria-label="发送消息"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
