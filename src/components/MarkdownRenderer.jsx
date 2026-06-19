import { useMemo } from 'react'

const CLASS_MAP = {
  h1: 'text-2xl font-semibold tracking-tight text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-100',
  h2: 'text-xl font-semibold tracking-tight text-gray-900 mt-7 mb-3',
  h3: 'text-base font-semibold text-gray-800 mt-5 mb-2',
  p: 'text-gray-700 leading-[1.85] text-[15px] mb-4 whitespace-pre-wrap',
  ul: 'list-disc list-outside pl-6 mb-4 space-y-1.5 text-gray-700 leading-[1.85] text-[15px]',
  ol: 'list-decimal list-outside pl-6 mb-4 space-y-1.5 text-gray-700 leading-[1.85] text-[15px]',
  li: 'text-gray-700 leading-[1.85] text-[15px]',
  blockquote: 'border-l-4 border-blue-200 bg-blue-50/60 pl-4 py-2 my-4 text-gray-700 italic leading-[1.85] text-[15px]',
  code: 'font-mono text-[13px] px-1.5 py-0.5 bg-gray-100 text-rose-600 rounded-md',
  pre: 'bg-gray-900 text-gray-100 rounded-2xl p-5 my-5 overflow-x-auto font-mono text-[13px] leading-relaxed',
  hr: 'border-gray-100 my-6',
  table: 'w-full text-left border-collapse my-5 text-sm',
  th: 'bg-gray-50 text-gray-700 font-semibold px-3 py-2 border border-gray-200',
  td: 'px-3 py-2 border border-gray-100 text-gray-700',
  strong: 'font-semibold text-gray-900',
  em: 'italic text-gray-800',
  a: 'text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700',
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"]/g, (c) => map[c] || c)
}

function renderInline(line) {
  let out = escapeHtml(line)

  // inline code `code`
  out = out.replace(/`([^`]+)`/g, (_m, code) => `<code class="${CLASS_MAP.code}">${code}</code>`)

  // bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, (_m, text) => `<strong class="${CLASS_MAP.strong}">${text}</strong>`)
  out = out.replace(/__([^_]+)__/g, (_m, text) => `<strong class="${CLASS_MAP.strong}">${text}</strong>`)

  // italics *text*
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, (_m, prefix, text) => `${prefix}<em class="${CLASS_MAP.em}">${text}</em>`)

  // links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, url) => `<a href="${url}" class="${CLASS_MAP.a}" target="_blank" rel="noopener noreferrer">${text}</a>`,
  )

  // ★★★★★ star ratings preserved
  return out
}

function renderTree(block) {
  if (block.type === 'heading') {
    const cls = block.level === 1 ? CLASS_MAP.h1 : block.level === 2 ? CLASS_MAP.h2 : CLASS_MAP.h3
    return `<h${block.level} class="${cls}">${renderInline(block.text)}</h${block.level}>`
  }
  if (block.type === 'paragraph') {
    return `<p class="${CLASS_MAP.p}">${renderInline(block.text)}</p>`
  }
  if (block.type === 'list') {
    const tag = block.ordered ? 'ol' : 'ul'
    const items = block.items
      .map(
        (li) =>
          `<li class="${CLASS_MAP.li}">${li
            .split('\n')
            .filter((l) => l.trim())
            .map(renderInline)
            .join('<br>')}</li>`,
      )
      .join('')
    return `<${tag} class="${CLASS_MAP[tag]}">${items}</${tag}>`
  }
  if (block.type === 'blockquote') {
    const inner = block.lines.map((l) => `<p class="${CLASS_MAP.p}">${renderInline(l)}</p>`).join('')
    return `<blockquote class="${CLASS_MAP.blockquote}">${inner}</blockquote>`
  }
  if (block.type === 'code') {
    return `<pre class="${CLASS_MAP.pre}"><code>${escapeHtml(block.text)}</code></pre>`
  }
  if (block.type === 'hr') {
    return `<hr class="${CLASS_MAP.hr}" />`
  }
  if (block.type === 'table') {
    let html = `<table class="${CLASS_MAP.table}"><thead><tr>`
    block.header.forEach((h) => {
      html += `<th class="${CLASS_MAP.th}">${renderInline(h)}</th>`
    })
    html += '</tr></thead><tbody>'
    block.rows.forEach((row) => {
      html += '<tr>'
      row.forEach((cell) => {
        html += `<td class="${CLASS_MAP.td}">${renderInline(cell)}</td>`
      })
      html += '</tr>'
    })
    html += '</tbody></table>'
    return html
  }
  return `<p class="${CLASS_MAP.p}">${renderInline(block.text || '')}</p>`
}

function parseMarkdown(md) {
  const cleanSource = (md || '').replace(/\r\n/g, '\n')
  const lines = cleanSource.split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // code block
    if (/^```/.test(trimmed)) {
      const lang = trimmed.replace(/^```/, '').trim()
      const codeLines = []
      i++
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({ type: 'code', text: codeLines.join('\n'), lang })
      continue
    }

    // horizontal rule
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2].trim() })
      i++
      continue
    }

    // table: detect header + separator
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      const parseRow = (ln) => ln.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim())
      const header = parseRow(line)
      // skip separator line
      i += 2
      const rows = []
      while (i < lines.length && lines[i].trim() && /\|/.test(lines[i]) && !/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i])) {
        rows.push(parseRow(lines[i]))
        i++
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const bqLines = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        bqLines.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      blocks.push({ type: 'blockquote', lines: bqLines })
      continue
    }

    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    // ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // empty line
    if (trimmed === '') {
      i++
      continue
    }

    // paragraph: accumulate until blank line or block start
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') })
    } else {
      i++
    }
  }

  return blocks
}

export default function MarkdownRenderer({ markdown }) {
  const html = useMemo(() => {
    if (!markdown) return ''
    const blocks = parseMarkdown(markdown)
    return blocks.map(renderTree).join('\n')
  }, [markdown])

  if (!markdown) {
    return (
      <p className="text-sm text-gray-400 italic">
        Waiting for analysis...
      </p>
    )
  }

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
}
