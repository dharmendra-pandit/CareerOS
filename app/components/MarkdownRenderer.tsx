'use client'

import React, { useState } from 'react'

// Helper to strip markdown formatting from a string for text previews
export function stripMarkdown(content: string): string {
  if (!content) return ''
  
  return content
    // Remove code blocks entirely
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code ticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove bold and italic markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove link notations [text](url) -> text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    // Remove headers (# Heading)
    .replace(/^#{1,6}\s+(.*)$/gm, '$1')
    // Remove table divider lines (e.g. |---|---|)
    .replace(/^[|:\-\s]+$/gm, '')
    // Remove table rows entirely or simplify
    .replace(/^\|(.*)\|$/gm, '')
    // Replace multiple newlines/spaces with a single space
    .replace(/\s+/g, ' ')
    .trim()
}

// Regex to parse inline markdown elements into React nodes
export function parseInline(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  
  // Regex pattern matches:
  // 1: Bold with ** or __ (captures 1: delimiter, 2: content)
  // 3: Italic with * or _ (captures 3: delimiter, 4: content)
  // 5: Inline code with ` (captures 5: content)
  // 6, 7: Link with [text](url) (captures 6: text, 7: url)
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g
  
  let match
  let keyIndex = 0
  
  while ((match = regex.exec(text)) !== null) {
    const startIndex = match.index
    
    // Add text before match
    if (startIndex > lastIndex) {
      nodes.push(text.substring(lastIndex, startIndex))
    }
    
    if (match[1]) {
      // Bold
      nodes.push(<strong key={keyIndex++} className="font-extrabold text-zinc-100">{match[2]}</strong>)
    } else if (match[3]) {
      // Italic
      nodes.push(<em key={keyIndex++} className="italic text-zinc-300">{match[4]}</em>)
    } else if (match[5]) {
      // Inline code
      nodes.push(
        <code key={keyIndex++} className="bg-zinc-950/80 border border-zinc-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
          {match[5]}
        </code>
      )
    } else if (match[6] && match[7]) {
      // Link
      nodes.push(
        <a 
          key={keyIndex++} 
          href={match[7]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/50 hover:decoration-indigo-400 transition-colors"
        >
          {match[6]}
        </a>
      )
    }
    
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex))
  }
  
  return nodes.length > 0 ? nodes : text
}

interface Block {
  type: 'paragraph' | 'heading' | 'code' | 'list' | 'table' | 'blockquote' | 'hr' | 'empty'
  lines: string[]
  level?: number
  listType?: 'ordered' | 'unordered'
  language?: string
}

const isSeparatorLine = (line: string): boolean => {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false
  const stripped = trimmed.replace(/[|:\-\s]/g, '')
  return stripped === ''
}

const parseTableRow = (line: string): string[] => {
  const trimmed = line.trim()
  const withoutOuterPipes = trimmed.replace(/^\||\|$/g, '')
  return withoutOuterPipes.split('|').map(cell => cell.trim())
}

const parseBlocks = (text: string): Block[] => {
  const lines = text.split(/\r?\n/)
  const blocks: Block[] = []
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Code block check
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push({
        type: 'code',
        lines: codeLines,
        language: language || 'plaintext'
      })
      i++ // Skip closing backticks
      continue
    }
    
    // Table check
    if (trimmed.startsWith('|')) {
      // Peek next line to see if it's a separator
      const nextLine = lines[i + 1]
      if (nextLine && isSeparatorLine(nextLine)) {
        const tableLines: string[] = [line, nextLine]
        i += 2
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i])
          i++
        }
        blocks.push({
          type: 'table',
          lines: tableLines
        })
        continue
      }
    }
    
    // Blockquote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [trimmed.replace(/^>\s*/, '')]
      i++
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''))
        i++
      }
      blocks.push({
        type: 'blockquote',
        lines: quoteLines
      })
      continue
    }
    
    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({
        type: 'hr',
        lines: [line]
      })
      i++
      continue
    }
    
    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        lines: [headingMatch[2]]
      })
      i++
      continue
    }
    
    // Lists
    const unorderedMatch = line.match(/^(\s*)([-*+])\s+(.*)$/)
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/)
    
    if (unorderedMatch || orderedMatch) {
      const listType = unorderedMatch ? 'unordered' : 'ordered'
      const listLines: string[] = [line]
      i++
      while (i < lines.length) {
        const nextLine = lines[i]
        if (nextLine.match(/^(\s*)([-*+])\s+(.*)$/) || nextLine.match(/^(\s*)(\d+)\.\s+(.*)$/)) {
          listLines.push(nextLine)
          i++
        } else {
          break
        }
      }
      blocks.push({
        type: 'list',
        listType,
        lines: listLines
      })
      continue
    }
    
    // Empty line
    if (trimmed === '') {
      blocks.push({
        type: 'empty',
        lines: [line]
      })
      i++
      continue
    }
    
    // Paragraph
    const paragraphLines: string[] = [line]
    i++
    while (i < lines.length) {
      const nextLine = lines[i]
      const nextTrimmed = nextLine.trim()
      
      if (
        nextTrimmed.startsWith('```') ||
        nextTrimmed.startsWith('|') ||
        nextTrimmed.startsWith('>') ||
        nextTrimmed === '---' || nextTrimmed === '***' || nextTrimmed === '___' ||
        nextLine.match(/^(#{1,6})\s+/) ||
        nextLine.match(/^(\s*)([-*+])\s+/) ||
        nextLine.match(/^(\s*)(\d+)\.\s+/) ||
        nextTrimmed === ''
      ) {
        break
      }
      paragraphLines.push(nextLine)
      i++
    }
    blocks.push({
      type: 'paragraph',
      lines: paragraphLines
    })
  }
  
  return blocks
}

// Sub-component for code rendering with copy button
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }
  
  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-2xl flex flex-col font-mono text-xs md:text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-850/80 text-[10px] uppercase tracking-wider font-bold text-zinc-400">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors bg-zinc-950/40 hover:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-850/60 cursor-pointer select-none font-sans"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-zinc-300 leading-relaxed font-mono whitespace-pre text-left">
        <code>{code}</code>
      </div>
    </div>
  )
}

// Sub-component for rendering table blocks
const MarkdownTable = ({ lines }: { lines: string[] }) => {
  if (lines.length < 2) return null
  
  const headers = parseTableRow(lines[0])
  const rows = lines.slice(2).map(line => parseTableRow(line))
  
  return (
    <div className="my-6 overflow-x-auto border border-zinc-850 rounded-xl bg-zinc-950/20 shadow-md">
      <table className="w-full text-left text-xs md:text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider text-[10px] bg-zinc-950/40">
            {headers.map((header, idx) => (
              <th key={idx} className="p-3.5 pl-4 font-bold text-zinc-200">
                {parseInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850/50 font-medium">
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-zinc-900/30 text-zinc-300">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="p-3.5 pl-4 max-w-xs truncate text-zinc-300">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null
  
  const blocks = parseBlocks(content)
  
  return (
    <div className="space-y-4 text-zinc-300 leading-relaxed font-medium">
      {blocks.map((block, blockIdx) => {
        switch (block.type) {
          case 'heading': {
            const level = block.level || 1
            const text = block.lines[0]
            const children = parseInline(text)
            
            if (level === 1) {
              return (
                <h2 key={blockIdx} className="text-2xl md:text-3xl font-black text-zinc-100 tracking-tight mt-8 mb-4 border-b border-zinc-900 pb-2 text-left">
                  {children}
                </h2>
              )
            }
            if (level === 2) {
              return (
                <h3 key={blockIdx} className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight mt-6 mb-3 text-left">
                  {children}
                </h3>
              )
            }
            if (level === 3) {
              return (
                <h4 key={blockIdx} className="text-lg font-bold text-zinc-200 tracking-tight mt-5 mb-2 text-left">
                  {children}
                </h4>
              )
            }
            return (
              <h5 key={blockIdx} className="text-base font-bold text-zinc-250 mt-4 mb-2 text-left">
                {children}
              </h5>
            )
          }
          
          case 'paragraph': {
            const joined = block.lines.join('\n')
            return (
              <p key={blockIdx} className="text-sm md:text-base text-zinc-300 whitespace-pre-wrap text-left my-3 leading-relaxed">
                {parseInline(joined)}
              </p>
            )
          }
          
          case 'code': {
            const joinedCode = block.lines.join('\n')
            return (
              <CodeBlock 
                key={blockIdx} 
                code={joinedCode} 
                language={block.language || 'plaintext'} 
              />
            )
          }
          
          case 'table': {
            return <MarkdownTable key={blockIdx} lines={block.lines} />
          }
          
          case 'blockquote': {
            const joinedQuote = block.lines.join('\n')
            return (
              <blockquote key={blockIdx} className="border-l-4 border-indigo-500 pl-4 py-1.5 my-4 text-zinc-400 italic font-medium bg-indigo-500/5 rounded-r-lg text-left">
                {parseInline(joinedQuote)}
              </blockquote>
            )
          }
          
          case 'list': {
            const isOrdered = block.listType === 'ordered'
            const Tag = isOrdered ? 'ol' : 'ul'
            const listClass = isOrdered 
              ? 'list-decimal pl-6 my-4 space-y-2 text-zinc-300 text-sm md:text-base text-left' 
              : 'list-disc pl-6 my-4 space-y-2 text-zinc-300 text-sm md:text-base text-left'
            
            return (
              <Tag key={blockIdx} className={listClass}>
                {block.lines.map((line, lineIdx) => {
                  const cleanedText = isOrdered 
                    ? line.replace(/^\s*\d+\.\s+/, '') 
                    : line.replace(/^\s*[-*+]\s+/, '')
                  return (
                    <li key={lineIdx} className="leading-relaxed">
                      {parseInline(cleanedText)}
                    </li>
                  )
                })}
              </Tag>
            )
          }
          
          case 'hr': {
            return <hr key={blockIdx} className="my-8 border-t border-zinc-900" />
          }
          
          case 'empty':
          default:
            return <div key={blockIdx} className="h-2" />
        }
      })}
    </div>
  )
}
