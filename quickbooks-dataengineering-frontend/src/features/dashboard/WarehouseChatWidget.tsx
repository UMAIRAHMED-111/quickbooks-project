import { Bot, Loader2, SendHorizontal, Sparkles, X } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/errorCodes"
import { StructuredAnswer } from "@/features/dashboard/components/StructuredAnswer"
import { useWarehouseQaMutation } from "@/features/dashboard/hooks/useMetrics"
import { cn } from "@/lib/utils"
import type { QaContextMessage } from "@/types/metrics"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  isError?: boolean
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type WarehouseChatWidgetProps = {
  /** Bumps when warehouse sync succeeds — remounts the thread so answers match fresh data. */
  dataEpoch: number
}

/**
 * One conversation instance; parent sets key={dataEpoch} to reset after sync.
 */
function WarehouseChatConversation() {
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const qa = useWarehouseQaMutation()
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    queueMicrotask(() => textareaRef.current?.focus())
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, qa.isPending])

  const appendMessage = useCallback((msg: Omit<ChatMessage, "id">) => {
    setMessages((m) => [...m, { ...msg, id: newId() }])
  }, [])

  const send = useCallback(() => {
    const q = draft.trim()
    if (!q || qa.isPending) return

    const context: QaContextMessage[] = messages
      .filter((m) => !m.isError && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }))

    appendMessage({ role: "user", content: q })
    setDraft("")

    qa.mutate(
      { question: q, context: context.length ? context : undefined },
      {
        onSuccess: (res) => {
          appendMessage({ role: "assistant", content: res.answer })
        },
        onError: (err) => {
          appendMessage({
            role: "assistant",
            content: getErrorMessage(err),
            isError: true,
          })
        },
      }
    )
  }, [appendMessage, draft, messages, qa])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 pt-4 pb-6"
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground m-auto max-w-[280px] px-2 text-center text-sm leading-relaxed">
            Try: “Which customers have the highest overdue balance?”
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[min(100%,340px)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : m.isError
                      ? "bg-destructive/10 text-destructive border-destructive/20 rounded-bl-md border"
                      : "bg-muted text-foreground rounded-bl-md border border-transparent"
                )}
              >
                {m.role === "assistant" && !m.isError ? (
                  <StructuredAnswer text={m.content} className="space-y-3" />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {qa.isPending ? (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-2xl rounded-bl-md border border-transparent px-3.5 py-2.5 text-sm shadow-sm">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              Thinking…
            </div>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-border bg-background shrink-0 space-y-2 border-t px-3 pt-3 pb-4 max-sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
      >
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message the warehouse…"
          rows={2}
          disabled={qa.isPending}
          className="min-h-[72px] resize-none text-sm"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            size="default"
            className="gap-2"
            disabled={qa.isPending || !draft.trim()}
          >
            {qa.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <SendHorizontal className="size-4" aria-hidden />
            )}
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

export function WarehouseChatWidget({ dataEpoch }: WarehouseChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full border border-white/15 text-white transition-[transform,box-shadow] duration-200",
          "bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#5c1fa3]",
          "shadow-[0_10px_36px_-8px_rgba(92,31,163,0.55),0_4px_16px_rgba(0,0,0,0.28)]",
          "hover:scale-105 hover:shadow-[0_14px_44px_-8px_rgba(92,31,163,0.6),0_6px_20px_rgba(0,0,0,0.3)]",
          "active:scale-95",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        )}
        aria-label="Open warehouse assistant"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
      >
        <Bot className="size-7" strokeWidth={1.75} aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-end sm:items-stretch sm:justify-end sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          />

          <aside
            role="dialog"
            aria-modal
            aria-labelledby={titleId}
            className={cn(
              "border-border bg-background relative z-[101] flex max-h-[min(92vh,720px)] w-full max-w-[440px] flex-col overflow-hidden shadow-2xl",
              "max-sm:max-h-[85vh] max-sm:rounded-t-3xl max-sm:border-t max-sm:border-x",
              "sm:max-h-[min(calc(100vh-2rem),720px)] sm:rounded-2xl sm:border"
            )}
          >
            <header className="border-border flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-xl">
                    <Sparkles className="text-primary size-4" aria-hidden />
                  </div>
                  <div>
                    <h2 id={titleId} className="text-foreground text-base font-semibold tracking-tight">
                      Warehouse assistant
                    </h2>
                    <p className="text-muted-foreground text-xs leading-snug">
                      Ask in plain English — answers use your latest sync (server-side).
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </header>

            <WarehouseChatConversation key={dataEpoch} />
          </aside>
        </div>
      ) : null}
    </>
  )
}
