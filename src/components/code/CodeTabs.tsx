import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { CodeBlock } from './CodeBlock'

export interface CodeExample {
  id: string
  title: string
  description: string
  code: string
  filename: string
  language?: string
}

interface CodeTabsProps {
  examples: CodeExample[]
}

export function CodeTabs({ examples }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(examples[0]?.id || '')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const activeExample = examples.find((ex) => ex.id === activeTab) || examples[0]

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const tabCount = examples.length
    let newIndex: number | null = null

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        newIndex = (index + 1) % tabCount
        break
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = (index - 1 + tabCount) % tabCount
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = tabCount - 1
        break
    }

    if (newIndex !== null) {
      const example = examples[newIndex]
      if (example) {
        setActiveTab(example.id)
        tabRefs.current[newIndex]?.focus()
      }
    }
  }, [examples])

  const setTabRef = useCallback((el: HTMLButtonElement | null, index: number) => {
    tabRefs.current[index] = el
  }, [])

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div
        className="flex flex-wrap gap-1 md:gap-2 p-1 bg-slate-800 rounded-lg border border-slate-700"
        role="tablist"
        aria-label="Code examples"
      >
        {examples.map((example, index) => (
          <button
            key={example.id}
            ref={(el) => setTabRef(el, index)}
            onClick={() => setActiveTab(example.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-selected={activeTab === example.id}
            aria-controls={`tabpanel-${example.id}`}
            id={`tab-${example.id}`}
            tabIndex={activeTab === example.id ? 0 : -1}
            className={`relative px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
              activeTab === example.id
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === example.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-600 rounded-md"
                initial={false}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{example.title}</span>
          </button>
        ))}
      </div>

      {/* Description and code */}
      {activeExample && (
        <motion.div
          key={activeExample.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
          role="tabpanel"
          id={`tabpanel-${activeExample.id}`}
          aria-labelledby={`tab-${activeExample.id}`}
          tabIndex={0}
        >
          <p className="text-slate-400 text-xs md:text-sm">{activeExample.description}</p>
          <CodeBlock
            code={activeExample.code}
            filename={activeExample.filename}
            language={activeExample.language}
          />
        </motion.div>
      )}
    </div>
  )
}
