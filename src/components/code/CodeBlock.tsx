import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { motion, AnimatePresence } from 'framer-motion'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language = 'typescript', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
      {/* Header with filename and copy button */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80" />
          </div>
          {filename && (
            <span className="text-slate-400 text-xs md:text-sm font-mono ml-2">{filename}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm rounded-md transition-colors bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-green-400"
                role="status"
                aria-live="polite"
              >
                <CheckIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Copied!</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <CopyIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Copy</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Code content */}
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-3 md:p-4 overflow-x-auto text-xs md:text-sm`}
            style={{ ...style, background: 'transparent', margin: 0 }}
            tabIndex={0}
            role="region"
            aria-label={`Code example${filename ? `: ${filename}` : ''}`}
          >
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span
                    className="table-cell pr-3 md:pr-4 text-slate-500 select-none text-right w-6 md:w-8"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}
