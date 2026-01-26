import { motion } from 'framer-motion'
import { CodeTabs } from '../components/code'
import { codeExamples } from '../data/codeExamples'

export function CodeExamplesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-slate-50 mb-4">Code Examples</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Learn how to use the Agent Relay SDK with these syntax-highlighted code examples.
          Each example demonstrates a key feature of the SDK, from basic setup to advanced
          channel-based communication.
        </p>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        {codeExamples.map((example) => (
          <span
            key={example.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700 text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-300">{example.title}</span>
          </span>
        ))}
      </motion.div>

      {/* Code Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-slate-800/50 rounded-xl border border-slate-700 p-6"
      >
        <CodeTabs examples={codeExamples} />
      </motion.div>

      {/* Installation Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <InfoIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-blue-300 font-medium mb-1">Getting Started</h3>
            <p className="text-slate-400 text-sm">
              Install the Agent Relay SDK using npm:
              <code className="ml-2 px-2 py-0.5 bg-slate-900 rounded text-blue-300 font-mono text-xs">
                npm install @anthropic/agent-relay
              </code>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <FeatureCard
          icon={<BoltIcon className="w-5 h-5" />}
          title="Real-time Communication"
          description="WebSocket-based messaging with low latency and guaranteed delivery"
        />
        <FeatureCard
          icon={<UsersIcon className="w-5 h-5" />}
          title="Multi-Agent Support"
          description="Connect unlimited agents with direct, broadcast, and channel messaging"
        />
        <FeatureCard
          icon={<ShieldIcon className="w-5 h-5" />}
          title="Type-Safe SDK"
          description="Full TypeScript support with comprehensive type definitions"
        />
      </motion.div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          {icon}
        </div>
        <h3 className="text-slate-50 font-medium">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  )
}
