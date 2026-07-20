"use client";

import Link from "next/link";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import { askTourAction } from "@/app/actions/ask";
import type { AskResult } from "@/lib/ask/types";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      result?: AskResult;
      error?: string;
      pending?: boolean;
    };

export function AskForm({
  suggestions,
  tourLabel,
}: {
  suggestions: string[];
  tourLabel: string;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, startTransition] = useTransition();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useEffectEvent(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, pending]);

  function resizeInput() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function submit(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || pending) return;

    const userId = `u-${Date.now()}`;
    const assistantId = `a-${Date.now()}`;

    setQuestion("");
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text: trimmed },
      { id: assistantId, role: "assistant", pending: true },
    ]);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.focus();
      }
    });

    startTransition(async () => {
      const response = await askTourAction(trimmed);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== assistantId || msg.role !== "assistant") return msg;
          if (!response.ok) {
            return { id: assistantId, role: "assistant", error: response.error };
          }
          return {
            id: assistantId,
            role: "assistant",
            result: response.result,
          };
        }),
      );
    });
  }

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto px-1 pb-4 pt-2"
      >
        {empty ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center px-2 text-center">
            <p className="text-sm text-[var(--muted)]">{tourLabel}</p>
            <h1 className="mt-2 font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              Ask the tour
            </h1>
            <p className="mt-3 max-w-md text-sm text-[var(--muted)]">
              Answers come from your show database — not guesses.
            </p>
            {suggestions.length > 0 ? (
              <ul className="mt-8 flex w-full max-w-lg flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      className="w-full rounded-[var(--radius-lg)] bg-[var(--surface)] px-4 py-3 text-left text-sm text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)]"
                      disabled={pending}
                      onClick={() => submit(suggestion)}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-2">
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-[1.125rem] rounded-br-md bg-[var(--surface)] px-4 py-2.5 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
                    {message.text}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[92%] space-y-3">
                    {message.pending ? (
                      <p className="text-sm text-[var(--muted)]">Looking up…</p>
                    ) : message.error ? (
                      <p className="text-sm text-[var(--danger)]" role="alert">
                        {message.error}
                      </p>
                    ) : message.result ? (
                      <AssistantBubble result={message.result} />
                    ) : null}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--paper)] pt-3 pb-1">
        <form
          className="mx-auto w-full max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            submit(question);
          }}
        >
          <div className="flex items-end gap-2 rounded-[1.25rem] bg-[var(--surface)] p-2 shadow-[inset_0_0_0_1px_var(--border)] focus-within:shadow-[inset_0_0_0_1px_var(--accent),0_0_0_3px_var(--accent-soft)]">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Message</span>
              <textarea
                ref={inputRef}
                name="question"
                rows={1}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  resizeInput();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(question);
                  }
                }}
                className="block max-h-40 w-full resize-none bg-transparent px-3 py-2.5 text-[0.9375rem] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
                placeholder="Ask about a show, flight, hotel, or gap…"
                disabled={pending}
                autoComplete="off"
                maxLength={500}
              />
            </label>
            <button
              type="submit"
              disabled={pending || !question.trim()}
              aria-label="Send"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)] transition-opacity disabled:opacity-35"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-xs text-[var(--muted)]">
            From structured tour data only · Enter to send
          </p>
        </form>
      </div>
    </div>
  );
}

function AssistantBubble({ result }: { result: AskResult }) {
  const hasAnswer = Boolean(result.answer?.trim());
  const hasUnknowns = result.unknowns.length > 0;
  const hasCitations = result.citations.length > 0;

  return (
    <div className="space-y-3" aria-live="polite">
      {hasAnswer ? (
        <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-[var(--ink)]">
          {result.answer}
        </p>
      ) : (
        <div>
          <p className="text-[0.9375rem] leading-relaxed text-[var(--ink)]">
            Nothing matched in the tour data.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Try a city, date, or show name — or{" "}
            <Link href="/tour/import" className="text-[var(--accent)]">
              import more
            </Link>
            .
          </p>
        </div>
      )}

      {hasCitations ? (
        <ul className="space-y-1.5">
          {result.citations.map((citation, index) => (
            <li key={`${citation.showId}-${citation.kind}-${index}`}>
              <Link
                href={`/tour/shows/${citation.showId}`}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--surface)] px-3 py-2.5 transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--ink)]">
                    {citation.label}
                  </span>
                  <span className="mt-0.5 block text-xs capitalize text-[var(--muted)]">
                    {citation.kind}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-[var(--muted)]">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {hasUnknowns ? (
        <ul className="space-y-1">
          {result.unknowns.map((item) => (
            <li key={item} className="text-sm text-[var(--accent)]">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 12.5V3.5M8 3.5L3.5 8M8 3.5L12.5 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
