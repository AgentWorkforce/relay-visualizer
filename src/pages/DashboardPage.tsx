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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-50 mb-4">
          Live Dashboard
        </h1>
        <p className="text-slate-400 mb-6">
          View the relay dashboard showing connected agents and message history.
        </p>
      </motion.div>

      {/* Dashboard Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <DashboardInstructions />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex gap-4 mb-6"
      >
        <button
          onClick={handleOpenInNewTab}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <ExternalLinkIcon />
          Open in New Tab
        </button>
        {status === 'error' && (
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            <RefreshIcon />
            Retry
          </button>
        )}
      </motion.div>

      {/* Dashboard Iframe Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        {/* Loading State */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-slate-400 mt-4">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Error/Fallback State */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
            <FallbackUI onOpenInNewTab={handleOpenInNewTab} onRetry={handleRetry} />
          </div>
        )}

        {/* Iframe - always rendered but may be hidden */}
        <iframe
          key={`iframe-${retryKey}`}
          src={DASHBOARD_URL}
          title="Agent Relay Dashboard"
          className={`w-full border-0 ${status === 'error' ? 'invisible' : ''}`}
          style={{ minHeight: '600px', height: 'calc(100vh - 350px)' }}
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
      <h2 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <InfoIcon />
        What the Dashboard Shows
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InstructionCard
          icon={<AgentsIcon />}
          title="Connected Agents"
          description="View all agents currently connected to the relay daemon"
        />
        <InstructionCard
          icon={<MessagesIcon />}
          title="Message History"
          description="See real-time message flow between agents"
        />
        <InstructionCard
          icon={<ChannelsIcon />}
          title="Channels"
          description="Monitor active channels and subscriptions"
        />
        <InstructionCard
          icon={<StatsIcon />}
          title="Statistics"
          description="Track message counts and connection metrics"
        />
      </div>
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
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
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
    <div className="text-center px-6 py-8 max-w-lg">
      <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/10 rounded-full flex items-center justify-center">
        <WarningIcon />
      </div>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">
        Dashboard Unavailable
      </h3>
      <p className="text-slate-400 mb-6">
        Unable to connect to the Agent Relay dashboard. This usually means the relay daemon is not running.
      </p>
      <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
        <h4 className="text-sm font-medium text-slate-300 mb-2">To start the relay daemon:</h4>
        <code className="block text-sm text-blue-400 bg-slate-800 rounded px-3 py-2 font-mono">
          npx @anthropic/agent-relay
        </code>
        <p className="text-xs text-slate-500 mt-2">
          The dashboard will be available at localhost:3888
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <RefreshIcon />
          Retry Connection
        </button>
        <button
          onClick={onOpenInNewTab}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
        >
          <ExternalLinkIcon />
          Open in New Tab
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

  return (
    <span className={`w-2 h-2 rounded-full ${colors[status]} ${status === 'loading' ? 'animate-pulse' : ''}`} />
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// Icon Components
function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function AgentsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function ChannelsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
