import { useMemo, type ReactNode } from "react"
import { parseAnswerBlocks } from "@/lib/parseAnswerBlocks"
import { cn } from "@/lib/utils"

type StructuredAnswerProps = {
  text: string
  className?: string
}

const CURRENCY = /(\$[\d,]+(?:\.\d{1,2})?)/g

/** Currency + markdown-style **bold** (common in LLM answers). */
function formatCurrencyParts(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(CURRENCY)
  return parts.map((part, i) => {
    if (/^\$[\d,]+(?:\.\d{1,2})?$/.test(part)) {
      return (
        <span
          key={`${keyPrefix}-${i}`}
          className="text-foreground bg-primary/5 rounded px-1 py-0.5 font-semibold tabular-nums"
        >
          {part}
        </span>
      )
    }
    return part
  })
}

function formatInline(text: string): ReactNode {
  const segments = text.split(/(\*\*[\s\S]+?\*\*)/g)
  const out: ReactNode[] = []
  segments.forEach((seg, segIdx) => {
    const isBold =
      seg.startsWith("**") && seg.endsWith("**") && seg.length >= 4
    if (isBold) {
      const inner = seg.slice(2, -2)
      out.push(
        <strong
          key={`b-${segIdx}`}
          className="text-foreground font-semibold tracking-tight"
        >
          {formatCurrencyParts(inner, `b-${segIdx}`)}
        </strong>
      )
    } else {
      out.push(...formatCurrencyParts(seg, `t-${segIdx}`))
    }
  })
  return out
}

function ListBlock({ ordered, items }: { ordered: boolean; items: string[] }) {
  const ListTag = ordered ? "ol" : "ul"
  return (
    <ListTag className="m-0 list-none space-y-2.5 p-0">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="border-border/70 bg-background/90 rounded-lg border py-2.5 pr-3 pl-3 text-sm leading-relaxed shadow-sm"
        >
          <div className="flex gap-3">
            {ordered ? (
              <span
                className="bg-primary/8 text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums"
                aria-hidden
              >
                {idx + 1}
              </span>
            ) : (
              <span
                className="bg-primary mt-2 size-1.5 shrink-0 rounded-full"
                aria-hidden
              />
            )}
            <span className="text-foreground/95 min-w-0 flex-1 pt-0.5">
              {formatInline(item)}
            </span>
          </div>
        </li>
      ))}
    </ListTag>
  )
}

export function StructuredAnswer({ text, className }: StructuredAnswerProps) {
  const blocks = useMemo(() => parseAnswerBlocks(text), [text])

  if (blocks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm italic">No answer text returned.</p>
    )
  }

  return (
    <div className={cn("space-y-5", className)}>
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={i}
              className="text-foreground/95 text-[0.9375rem] leading-[1.65] tracking-tight"
            >
              {formatInline(block.text)}
            </p>
          )
        }
        if (block.type === "bullet") {
          return <ListBlock key={i} ordered={false} items={block.items} />
        }
        return <ListBlock key={i} ordered items={block.items} />
      })}
    </div>
  )
}
