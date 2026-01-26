import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ComponentNode,
  ConnectionLine,
  getConnectionPath,
  Position,
} from '../components/diagrams'

// Agent ID type
type AgentId = 'agent-a' | 'agent-b' | 'agent-c' | 'agent-d'

// Agent configuration with unique names and colors
interface Agent {
  id: AgentId
  name: string
  color: string
  variant: 'primary' | 'secondary' | 'accent' | 'default'
  icon: React.ReactNode
}

const agents: Agent[] = [
  {
    id: 'agent-a',
    name: 'Agent Alpha',
    color: '#3b82f6', // blue
    variant: 'primary',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'agent-b',
    name: 'Agent Beta',
    color: '#a855f7', // purple
    variant: 'secondary',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'agent-c',
    name: 'Agent Gamma',
    color: '#10b981', // emerald
    variant: 'accent',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'agent-d',
    name: 'Agent Delta',
    color: '#f59e0b', // amber
    variant: 'default',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

// Message type for the log
interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: Date
  status: 'sending' | 'delivered'
}

// In-flight message animation type
interface InFlightMessage {
  id: string
  fromId: AgentId
  toId: AgentId
  color: string
  phase: 'to-daemon' | 'to-receiver'
}

// Custom message bubble component that doesn't loop
function AnimatedMessageBubble({
  path,
  color,
  onComplete,
}: {
  path: string
  color: string
  onComplete: () => void
}) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="messageBubbleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.g
        initial={{ offsetDistance: '0%', opacity: 0 }}
        animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
          times: [0, 0.1, 0.85, 1],
        }}
        onAnimationComplete={onComplete}
        style={{
          offsetPath: `path("${path}")`,
          offsetRotate: '0deg',
        }}
      >
        {/* Outer glow */}
        <circle cx={0} cy={0} r={16} fill={color} opacity={0.3} filter="url(#messageBubbleGlow)" />
        {/* Main bubble */}
        <circle cx={0} cy={0} r={12} fill={color} stroke="white" strokeWidth={2} />
        {/* Envelope icon */}
        <path
          d="M-5,-3 L0,1 L5,-3 M-5,-3 L-5,4 L5,4 L5,-3"
          fill="none"
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  )
}

// Daemon icon component
function DaemonIcon() {
  return (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function MultiAgentDemoPage() {
  const [selectedSender, setSelectedSender] = useState<AgentId | null>(null)
  const [selectedReceiver, setSelectedReceiver] = useState<AgentId | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inFlightMessages, setInFlightMessages] = useState<InFlightMessage[]>([])
  const messageIdCounter = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 400 })

  // Track container size for responsive positioning
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Calculate responsive positions
  const daemonPosition: Position = { x: containerSize.width / 2, y: containerSize.height / 2 }

  // Agent positions arranged around the daemon - responsive
  const offsetX = Math.min(containerSize.width * 0.3, 160)
  const offsetY = Math.min(containerSize.height * 0.3, 80)

  const agentPositions: Record<AgentId, Position> = {
    'agent-a': { x: daemonPosition.x - offsetX, y: daemonPosition.y - offsetY }, // Top-left
    'agent-b': { x: daemonPosition.x + offsetX, y: daemonPosition.y - offsetY }, // Top-right
    'agent-c': { x: daemonPosition.x - offsetX, y: daemonPosition.y + offsetY }, // Bottom-left
    'agent-d': { x: daemonPosition.x + offsetX, y: daemonPosition.y + offsetY }, // Bottom-right
  }

  // Auto-scroll message log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages])

  const handleAgentClick = useCallback((agentId: AgentId) => {
    if (!selectedSender) {
      setSelectedSender(agentId)
    } else if (!selectedReceiver && agentId !== selectedSender) {
      setSelectedReceiver(agentId)
    } else if (agentId === selectedSender) {
      setSelectedSender(null)
      setSelectedReceiver(null)
    } else if (agentId === selectedReceiver) {
      setSelectedReceiver(null)
    } else {
      // If both are selected and clicking a different agent, replace receiver
      setSelectedReceiver(agentId)
    }
  }, [selectedSender, selectedReceiver])

  const sendMessage = useCallback(() => {
    if (!selectedSender || !selectedReceiver) return

    const senderAgent = agents.find((a) => a.id === selectedSender)
    const receiverAgent = agents.find((a) => a.id === selectedReceiver)
    if (!senderAgent || !receiverAgent) return

    const messageId = `msg-${++messageIdCounter.current}`
    const now = new Date()

    // Add message to log in 'sending' state
    const newMessage: Message = {
      id: messageId,
      from: senderAgent.name,
      to: receiverAgent.name,
      content: `Hello from ${senderAgent.name}!`,
      timestamp: now,
      status: 'sending',
    }
    setMessages((prev) => [...prev, newMessage])

    // Start the animation - first phase: sender to daemon
    const inFlight: InFlightMessage = {
      id: messageId,
      fromId: selectedSender,
      toId: selectedReceiver,
      color: senderAgent.color,
      phase: 'to-daemon',
    }
    setInFlightMessages((prev) => [...prev, inFlight])
  }, [selectedSender, selectedReceiver])

  const handlePhaseComplete = useCallback((messageId: string, phase: 'to-daemon' | 'to-receiver') => {
    if (phase === 'to-daemon') {
      // Move to second phase: daemon to receiver
      setInFlightMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, phase: 'to-receiver' as const } : m
        )
      )
    } else {
      // Animation complete - remove from in-flight and mark as delivered
      setInFlightMessages((prev) => prev.filter((m) => m.id !== messageId))
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, status: 'delivered' as const } : m
        )
      )
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedSender(null)
    setSelectedReceiver(null)
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
          Multi-Agent Demo
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Interactive simulation showing multiple agents communicating in real-time.
          Click agents to select sender and receiver, then send a message to see it
          route through the central daemon.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main visualization area */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-3 md:p-4">
            {/* Control bar */}
            <fieldset className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 pb-4 border-b border-slate-700">
              <legend className="sr-only">Message controls</legend>
              <div className="flex items-center gap-2">
                <label htmlFor="sender-select" className="text-sm text-slate-400">Sender:</label>
                <select
                  id="sender-select"
                  value={selectedSender || ''}
                  onChange={(e) => {
                    const value = e.target.value as AgentId | ''
                    setSelectedSender(value || null)
                    if (value === selectedReceiver) {
                      setSelectedReceiver(null)
                    }
                  }}
                  className="bg-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="receiver-select" className="text-sm text-slate-400">Receiver:</label>
                <select
                  id="receiver-select"
                  value={selectedReceiver || ''}
                  onChange={(e) => setSelectedReceiver((e.target.value as AgentId | '') || null)}
                  className="bg-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {agents
                    .filter((a) => a.id !== selectedSender)
                    .map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                >
                  Clear
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!selectedSender || !selectedReceiver}
                  className="px-3 md:px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                  aria-label={`Send message from ${selectedSender ? agents.find(a => a.id === selectedSender)?.name : 'sender'} to ${selectedReceiver ? agents.find(a => a.id === selectedReceiver)?.name : 'receiver'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <span className="hidden sm:inline">Send Message</span>
                  <span className="sm:hidden">Send</span>
                </button>
              </div>
            </fieldset>

            {/* Visualization canvas */}
            <div
              ref={containerRef}
              className="relative bg-slate-900/50 rounded-lg overflow-hidden"
              style={{ height: Math.min(400, Math.max(300, containerSize.width * 0.5)) }}
              role="img"
              aria-label="Multi-agent communication visualization showing four agents connected to a central daemon"
            >
              {/* Connection lines from each agent to daemon */}
              {agents.map((agent) => (
                <ConnectionLine
                  key={`line-${agent.id}`}
                  start={agentPositions[agent.id]}
                  end={daemonPosition}
                  animated={selectedSender === agent.id || selectedReceiver === agent.id}
                  color={agent.color}
                  strokeWidth={2}
                  dashArray="6,4"
                />
              ))}

              {/* In-flight message animations */}
              <AnimatePresence>
                {inFlightMessages.map((msg) => {
                  const fromPos = agentPositions[msg.fromId]
                  const toPos = agentPositions[msg.toId]

                  const path =
                    msg.phase === 'to-daemon'
                      ? getConnectionPath(fromPos, daemonPosition)
                      : getConnectionPath(daemonPosition, toPos)

                  return (
                    <motion.div
                      key={`${msg.id}-${msg.phase}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <AnimatedMessageBubble
                        path={path}
                        color={msg.color}
                        onComplete={() => handlePhaseComplete(msg.id, msg.phase)}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Agent nodes */}
              {agents.map((agent) => {
                const isSelected =
                  selectedSender === agent.id || selectedReceiver === agent.id
                const isSender = selectedSender === agent.id
                const isReceiver = selectedReceiver === agent.id

                return (
                  <div key={agent.id}>
                    <ComponentNode
                      label={agent.name}
                      icon={agent.icon}
                      position={agentPositions[agent.id]}
                      variant={agent.variant}
                      size="sm"
                      onClick={() => handleAgentClick(agent.id)}
                      ariaLabel={`${agent.name}${isSender ? ' (Selected as sender)' : isReceiver ? ' (Selected as receiver)' : ''} - Click to ${!selectedSender ? 'select as sender' : !selectedReceiver && agent.id !== selectedSender ? 'select as receiver' : 'change selection'}`}
                    />
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        className="absolute pointer-events-none"
                        style={{
                          left: agentPositions[agent.id].x,
                          top: agentPositions[agent.id].y,
                          transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        aria-hidden="true"
                      >
                        <div
                          className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium -mt-10 md:-mt-12 ${
                            isSender
                              ? 'bg-blue-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {isSender ? 'Sender' : isReceiver ? 'Receiver' : ''}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}

              {/* Central Daemon node */}
              <div className="relative">
                <motion.div
                  className="absolute flex flex-col items-center justify-center px-4 py-3 md:px-6 md:py-4 bg-slate-700 border-2 border-slate-500 rounded-xl cursor-default"
                  style={{
                    left: daemonPosition.x,
                    top: daemonPosition.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(100, 116, 139, 0.5)',
                  }}
                  role="img"
                  aria-label="Relay Daemon - central message broker"
                >
                  <DaemonIcon />
                  <span className="text-xs md:text-sm font-semibold text-slate-200 mt-1">
                    Relay Daemon
                  </span>
                </motion.div>
              </div>

              {/* Instructions overlay when nothing selected */}
              {!selectedSender && (
                <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 text-center">
                  <p className="text-xs md:text-sm text-slate-500 bg-slate-800/80 rounded-lg py-2 px-4 inline-block">
                    Click an agent to select it as sender, then click another to select receiver
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message log panel */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 h-full flex flex-col">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Message Log</h2>
              <span className="text-xs text-slate-500" aria-live="polite">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div
              ref={logRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ maxHeight: 440 }}
              role="log"
              aria-live="polite"
              aria-label="Message history"
            >
              <AnimatePresence mode="popLayout">
                {messages.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-slate-500 text-center py-8"
                  >
                    No messages yet. Send a message to see it appear here.
                  </motion.p>
                ) : (
                  messages.map((msg) => (
                    <motion.article
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                      aria-label={`Message from ${msg.from} to ${msg.to}: ${msg.content}. Status: ${msg.status}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-400">
                            {msg.from}
                          </span>
                          <svg
                            className="w-3 h-3 text-slate-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs font-medium text-emerald-400">
                            {msg.to}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            msg.status === 'sending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {msg.status === 'sending' ? 'Sending...' : 'Delivered'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{msg.content}</p>
                      <time className="text-xs text-slate-500" dateTime={msg.timestamp.toISOString()}>
                        {msg.timestamp.toLocaleTimeString()}
                      </time>
                    </motion.article>
                  ))
                )}
              </AnimatePresence>
            </div>
            {messages.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-700">
                <button
                  onClick={() => setMessages([])}
                  className="w-full px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                  aria-label="Clear all messages from log"
                >
                  Clear Log
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-4" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" className="text-sm font-semibold text-slate-300 mb-3">How it works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400 list-none p-0 m-0">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
              1
            </span>
            <p>Select a sender agent by clicking on it or using the dropdown</p>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
              2
            </span>
            <p>Select a receiver agent (different from sender)</p>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
              3
            </span>
            <p>Click "Send Message" to watch the message route through the daemon</p>
          </li>
        </ol>
      </section>
    </div>
  )
}
