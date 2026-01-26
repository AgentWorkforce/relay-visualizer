import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const DASHBOARD_URL = 'http://localhost:3888'
const CONNECTION_TIMEOUT_MS = 10000

type DashboardStatus = 'loading' | 'loaded' | 'error'

export function DashboardPage() {
  const [status, setStatus] = useState<DashboardStatus>('loading')
  const [retryKey, setRetryKey] = useState(0)
  const timeoutRef = useRef<number | null>(null)
  const hasLoadedRef = useRef(false)

  // Set up timeout for connection failure detection
  useEffect(() => {
    if (status === 'loading') {
      hasLoadedRef.current = false
      timeoutRef.current = window.setTimeout(() => {
        if (!hasLoadedRef.current) {
          setStatus('error')
        }
      }, CONNECTION_TIMEOUT_MS)
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [status, retryKey])

  const handleIframeLoad = useCallback(() => {
    hasLoadedRef.current = true
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setStatus('loaded')
  }, [])

  const handleIframeError = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setStatus('error')
  }, [])

  const handleOpenInNewTab = useCallback(() => {
    window.open(DASHBOARD_URL, '_blank', 'noopener,noreferrer')
  }, [])

  const handleRetry = useCallback(() => {
    setStatus('loading')
    setRetryKey((k) => k + 1)
  }, [])

  return (
    <div>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
          Live Dashboard
        </h1>
        <p className="text-slate-400 text-sm md:text-base mb-6">
          View the relay dashboard showing connected agents and message history.
        </p>
      </motion.header>

      {/* Dashboard Instructions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
        aria-labelledby="dashboard-info-heading"
      >
        <DashboardInstructions />
      </motion.section>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-wrap gap-3 md:gap-4 mb-6"
      >
        <button
          onClick={handleOpenInNewTab}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Open dashboard in new browser tab"
        >
          <ExternalLinkIcon />
          <span className="text-sm md:text-base">Open in New Tab</span>
        </button>
        {status === 'error' && (
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Retry connecting to dashboard"
          >
            <RefreshIcon />
            <span className="text-sm md:text-base">Retry</span>
          </button>
        )}
      </motion.div>

      {/* Dashboard Iframe Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* Loading State */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10" role="status" aria-live="polite">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-slate-400 mt-4">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Error/Fallback State */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10" role="alert">
            <FallbackUI onOpenInNewTab={handleOpenInNewTab} onRetry={handleRetry} />
          </div>
        )}

        {/* Iframe - always rendered but may be hidden */}
        <iframe
          key={`iframe-${retryKey}`}
          src={DASHBOARD_URL}
          title="Agent Relay Dashboard - shows connected agents, message history, and system statistics"
          className={`w-full border-0 ${status === 'error' ? 'invisible' : ''}`}
          style={{ minHeight: '400px', height: 'calc(100vh - 400px)', maxHeight: '600px' }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </motion.div>

      {/* Status Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="mt-4 flex items-center gap-2 text-sm"
        role="status"
        aria-live="polite"
      >
        <StatusIndicator status={status} />
        <span className="text-slate-500">
          {status === 'loading' && 'Connecting to relay daemon...'}
          {status === 'loaded' && 'Connected to relay daemon at localhost:3888'}
          {status === 'error' && 'Unable to connect to relay daemon'}
        </span>
      </motion.div>
    </div>
  )
}

function DashboardInstructions() {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <h2 id="dashboard-info-heading" className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <InfoIcon />
        <span>What the Dashboard Shows</span>
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0">
        <li>
          <InstructionCard
            icon={<AgentsIcon />}
            title="Connected Agents"
            description="View all agents currently connected to the relay daemon"
          />
        </li>
        <li>
          <InstructionCard
            icon={<MessagesIcon />}
            title="Message History"
            description="See real-time message flow between agents"
          />
        </li>
        <li>
          <InstructionCard
            icon={<ChannelsIcon />}
            title="Channels"
            description="Monitor active channels and subscriptions"
          />
        </li>
        <li>
          <InstructionCard
            icon={<StatsIcon />}
            title="Statistics"
            description="Track message counts and connection metrics"
          />
        </li>
      </ul>
    </div>
  )
}

function InstructionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <article className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400" aria-hidden="true">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </article>
  )
}

function FallbackUI({
  onOpenInNewTab,
  onRetry,
}: {
  onOpenInNewTab: () => void
  onRetry: () => void
}) {
  return (
    <div className="text-center px-4 md:px-6 py-6 md:py-8 max-w-lg">
      <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-amber-500/10 rounded-full flex items-center justify-center" aria-hidden="true">
        <WarningIcon />
      </div>
      <h2 className="text-lg md:text-xl font-semibold text-slate-200 mb-2">
        Dashboard Unavailable
      </h2>
      <p className="text-slate-400 text-sm md:text-base mb-6">
        Unable to connect to the Agent Relay dashboard. This usually means the relay daemon is not running.
      </p>
      <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
        <h3 className="text-sm font-medium text-slate-300 mb-2">To start the relay daemon:</h3>
        <code className="block text-sm text-blue-400 bg-slate-800 rounded px-3 py-2 font-mono overflow-x-auto">
          npx @anthropic/agent-relay
        </code>
        <p className="text-xs text-slate-500 mt-2">
          The dashboard will be available at localhost:3888
        </p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
        >
          <RefreshIcon />
          <span className="text-sm">Retry Connection</span>
        </button>
        <button
          onClick={onOpenInNewTab}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
        >
          <ExternalLinkIcon />
          <span className="text-sm">Open in New Tab</span>
        </button>
      </div>
    </div>
  )
}

function StatusIndicator({ status }: { status: DashboardStatus }) {
  const colors = {
    loading: 'bg-amber-400',
    loaded: 'bg-green-400',
    error: 'bg-red-400',
  }

  const labels = {
    loading: 'Connecting',
    loaded: 'Connected',
    error: 'Disconnected',
  }

  return (
    <span
      className={`w-2 h-2 rounded-full ${colors[status]} ${status === 'loading' ? 'animate-pulse' : ''}`}
      aria-label={labels[status]}
    />
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 md:h-10 md:w-10 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// Icon Components
function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="w-7 h-7 md:w-8 md:h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function AgentsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function ChannelsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
