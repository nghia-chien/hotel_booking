import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";
import {
  getChatbotSuggestions,
  postChatbotMessage,
  type ComboSuggestion,
  type PostMessageResponse,
} from "../api/chatbot.api";

type ChatRole = "user" | "assistant";

interface ChatLine {
  role: ChatRole;
  text: string;
  detail?: PostMessageResponse;
}

function formatAssistantReply(data: PostMessageResponse, t: (k: string) => string): string {
  const { analysis, suggestions } = data;
  const lines: string[] = [];
  lines.push(`${t("chatbot.intent")}: ${analysis.intent}`);
  if (typeof analysis.confidence === "number") {
    lines.push(`${t("chatbot.confidence")}: ${(analysis.confidence * 100).toFixed(0)}%`);
  }
  if (suggestions?.length) {
    lines.push("");
    lines.push(`${t("chatbot.suggestionsTitle")}:`);
    suggestions.forEach((c) => {
      lines.push(`• ${c.name} — ${c.price.toLocaleString("vi-VN")} ₫`);
    });
  }
  return lines.join("\n");
}

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [chips, setChips] = useState<ComboSuggestion[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const { combos } = await getChatbotSuggestions();
        if (!cancelled) setChips(combos ?? []);
      } catch {
        if (!cancelled) setChips([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    scrollBottom();
  }, [messages, scrollBottom]);

  const onOpen = () => {
    setOpen(true);
    setError(null);
    if (messages.length === 0) {
      setMessages([{ role: "assistant", text: t("chatbot.welcome") }]);
    }
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const data = await postChatbotMessage(trimmed, {});
      const reply = formatAssistantReply(data, t);
      setMessages((m) => [...m, { role: "assistant", text: reply, detail: data }]);
    } catch (e) {
      setError(t("chatbot.error"));
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: e instanceof Error ? e.message : t("chatbot.error"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[45] flex flex-col items-end gap-3 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {open && (
          <div
            className="flex w-[min(calc(100vw-2rem),22rem)] max-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-xl"
            role="dialog"
            aria-label={t("chatbot.title")}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2.5 bg-[var(--color-surface)]">
              <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                {t("chatbot.title")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setOpen(false)}
                aria-label={t("chatbot.close")}
              >
                <X className="size-4" />
              </Button>
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-border)] px-3 py-2 bg-white">
                {chips.slice(0, 4).map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => void send(`${t("chatbot.trySuggestion")}: ${c.name}`)}
                  >
                    {c.name}
                  </Button>
                ))}
              </div>
            )}

            <div
              ref={listRef}
              className="flex-1 min-h-[12rem] max-h-[40vh] overflow-y-auto px-3 py-2 space-y-2 bg-white"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
                    msg.role === "user"
                      ? "ml-6 bg-primary/10 text-[var(--color-text-primary)]"
                      : "mr-4 bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  )}
                >
                  {msg.text}
                  {msg.role === "assistant" && i === messages.length - 1 && msg.detail?.suggestions?.length ? (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                      <Link
                        to="/rooms"
                        className="text-primary text-xs font-medium hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        → {t("header.searchRoom")}
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}
              {loading && (
                <p className="text-xs text-[var(--color-text-secondary)] px-1">{t("chatbot.sending")}</p>
              )}
            </div>

            {error && <p className="px-3 text-xs text-destructive">{error}</p>}

            <form
              className="flex gap-2 border-t border-[var(--color-border)] p-2 bg-[var(--color-surface)]"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chatbot.placeholder")}
                className="flex-1 h-9 text-sm"
                disabled={loading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label={t("chatbot.send")}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        )}

        <Button
          type="button"
          size="icon"
          className={cn(
            "size-14 rounded-full shadow-lg pointer-events-auto",
            open && "ring-2 ring-primary/30"
          )}
          onClick={() => (open ? setOpen(false) : onOpen())}
          aria-expanded={open}
          aria-label={open ? t("chatbot.close") : t("chatbot.openLabel")}
        >
          <MessageCircle className="size-6" />
        </Button>
      </div>
    </div>
  );
}
