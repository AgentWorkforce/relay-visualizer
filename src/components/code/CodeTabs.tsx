import { useState } from 'react'
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

  const activeExample = examples.find((ex) => ex.id === activeTab) || examples[0]

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-800 rounded-lg border border-slate-700">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => setActiveTab(example.id)}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
              />
            )}
            <span className="relative z-10">{example.title}</span>
          </button>
        ))}
      </div>

      {/* Description */}
      {activeExample && (
        <motion.div
          key={activeExample.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <p className="text-slate-400 text-sm">{activeExample.description}</p>
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
