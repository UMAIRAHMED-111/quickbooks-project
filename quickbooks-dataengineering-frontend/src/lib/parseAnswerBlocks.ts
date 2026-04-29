export type AnswerBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullet"; items: string[] }
  | { type: "numbered"; items: string[] }

const BULLET_LINE = /^\s*(?:[-*•]|\u2022)\s+(.*)$/
const NUMBERED_LINE = /^\s*\d+\.\s+(.*)$/

function isBulletLine(line: string): boolean {
  return BULLET_LINE.test(line)
}

function isNumberedLine(line: string): boolean {
  return NUMBERED_LINE.test(line)
}

function stripBullet(line: string): string {
  const m = line.match(BULLET_LINE)
  return m?.[1]?.trim() ?? line.trim()
}

function stripNumbered(line: string): string {
  const m = line.match(NUMBERED_LINE)
  return m?.[1]?.trim() ?? line.trim()
}

/**
 * Splits a plain-text LLM answer into paragraphs and list blocks so we can render structured UI.
 */
export function parseAnswerBlocks(text: string): AnswerBlock[] {
  const lines = text.split(/\r?\n/)
  const blocks: AnswerBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    if (isBulletLine(line)) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim() && isBulletLine(lines[i])) {
        items.push(stripBullet(lines[i]))
        i++
      }
      blocks.push({ type: "bullet", items })
      continue
    }

    if (isNumberedLine(line)) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim() && isNumberedLine(lines[i])) {
        items.push(stripNumbered(lines[i]))
        i++
      }
      blocks.push({ type: "numbered", items })
      continue
    }

    const para: string[] = []
    while (i < lines.length) {
      const l = lines[i]
      if (!l.trim()) break
      if (isBulletLine(l) || isNumberedLine(l)) break
      para.push(l.trim())
      i++
    }
    blocks.push({ type: "paragraph", text: para.join(" ") })
  }

  return blocks
}
