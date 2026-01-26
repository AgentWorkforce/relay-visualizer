import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComponentNode, ConnectionLine } from '../components/diagrams'

interface ComponentInfo {
  id: string
  name: string
  description: string
  features: string[]
  variant: 'primary' | 'secondary' | 'accent' | 'default'
}

const componentData: Record<string, ComponentInfo> = {
  daemon: {
    id: 'daemon',
    name: 'Relay Daemon',
    description: 'The central hub that coordinates all agent communication. It runs as a background process and manages message routing between all connected components.',
    features: [
      'Message routing & delivery',
      'Agent registration & discovery',
      'Channel management',
      'WebSocket server for real-time updates',
      'REST API for dashboard integration',
    ],
    variant: 'primary',
  },
  sdk: {
    id: 'sdk',
    name: 'Agent SDK',
    description: 'TypeScript/JavaScript SDK that allows agents to connect to the relay system. Provides a simple API for sending and receiving messages.',
    features: [
      'Easy agent integration',
      'Automatic reconnection',
      'Message queuing',
      'Event-based API',
      'TypeScript support',
    ],
    variant: 'secondary',
  },
  mcp: {
    id: 'mcp',
    name: 'MCP Server',
    description: 'Model Context Protocol server that enables AI models like Claude to communicate through the relay system using MCP tools.',
    features: [
      'MCP protocol support',
      'Tool-based messaging',
      'Claude Code integration',
      'Automatic agent registration',
      'Inbox/outbox file management',
    ],
    variant: 'accent',
  },
  cli: {
    id: 'cli',
    name: 'CLI Tool',
    description: 'Command-line interface for managing the relay system, sending messages, and monitoring agent activity.',
    features: [
      'Daemon management (start/stop)',
      'Send messages between agents',
      'List connected agents',
      'Monitor message flow',
      'Debug & troubleshooting',
    ],
    variant: 'default',
  },
}

// Icons for each component
const DaemonIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
)

const SdkIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const McpIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const CliIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

interface InfoModalProps {
  info: ComponentInfo | null
  onClose: () => void
}

function InfoModal({ info, onClose }: InfoModalProps) {
  if (!info) return null

  const variantColors = {
    primary: 'border-blue-500 bg-blue-950/90',
    secondary: 'border-purple-500 bg-purple-950/90',
    accent: 'border-emerald-500 bg-emerald-950/90',
    default: 'border-slate-500 bg-slate-900/90',
  }

  const bulletColors = {
    primary: 'text-blue-400',
    secondary: 'text-purple-400',
    accent: 'text-emerald-400',
    default: 'text-slate-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`max-w-md w-full rounded-xl border-2 ${variantColors[info.variant]} p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{info.name}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-slate-300 mb-4">{info.description}</p>
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Key Features
          </h4>
          <ul className="space-y-1">
            {info.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className={`${bulletColors[info.variant]} mt-1`}>•</span>
                <span className="text-slate-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Click outside or press the X to close
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Legend() {
  const legendItems = [
    { variant: 'primary', label: 'Daemon (Central Hub)', color: 'bg-blue-500' },
    { variant: 'secondary', label: 'SDK (Agent Integration)', color: 'bg-purple-500' },
    { variant: 'accent', label: 'MCP (AI Model Interface)', color: 'bg-emerald-500' },
    { variant: 'default', label: 'CLI (Management Tool)', color: 'bg-slate-500' },
  ]

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
        Legend
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {legendItems.map((item) => (
          <div key={item.variant} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-1">
            <line
              x1="0" y1="5" x2="32" y2="5"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          </svg>
          <span className="text-xs text-slate-400">Bidirectional Connection</span>
        </div>
      </div>
    </div>
  )
}

export function ArchitecturePage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 600, height: 400 })

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

  // Calculate positions based on container size
  const centerX = containerSize.width / 2
  const centerY = containerSize.height / 2
  const horizontalOffset = Math.min(containerSize.width * 0.35, 200)
  const verticalOffset = Math.min(containerSize.height * 0.35, 140)

  const positions = {
    daemon: { x: centerX, y: centerY },
    sdk: { x: centerX - horizontalOffset, y: centerY },
    mcp: { x: centerX + horizontalOffset, y: centerY },
    cli: { x: centerX, y: centerY + verticalOffset },
  }

  const handleNodeClick = (componentId: string) => {
    setSelectedComponent(componentData[componentId])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-4">
          Architecture Overview
        </h1>
        <p className="text-slate-400 max-w-2xl">
          The Agent Relay system consists of four main components that work together
          to enable seamless communication between AI agents. Click on any component
          to learn more about its role and features.
        </p>
      </div>

      {/* Main diagram container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Diagram */}
        <div className="lg:col-span-3">
          <div
            ref={containerRef}
            className="bg-slate-800/50 rounded-lg border border-slate-700 relative overflow-hidden"
            style={{ minHeight: '450px', height: '60vh', maxHeight: '600px' }}
          >
            {/* Connection lines */}
            <ConnectionLine
              start={positions.sdk}
              end={positions.daemon}
              animated
              bidirectional
              color="#8b5cf6"
              animationDuration={2}
            />
            <ConnectionLine
              start={positions.mcp}
              end={positions.daemon}
              animated
              bidirectional
              color="#10b981"
              animationDuration={2}
            />
            <ConnectionLine
              start={positions.cli}
              end={positions.daemon}
              animated
              bidirectional
              color="#64748b"
              animationDuration={2}
            />

            {/* Component nodes */}
            <ComponentNode
              label="Relay Daemon"
              icon={<DaemonIcon />}
              position={positions.daemon}
              variant="primary"
              size="lg"
              onClick={() => handleNodeClick('daemon')}
            />
            <ComponentNode
              label="Agent SDK"
              icon={<SdkIcon />}
              position={positions.sdk}
              variant="secondary"
              size="lg"
              onClick={() => handleNodeClick('sdk')}
            />
            <ComponentNode
              label="MCP Server"
              icon={<McpIcon />}
              position={positions.mcp}
              variant="accent"
              size="lg"
              onClick={() => handleNodeClick('mcp')}
            />
            <ComponentNode
              label="CLI Tool"
              icon={<CliIcon />}
              position={positions.cli}
              variant="default"
              size="lg"
              onClick={() => handleNodeClick('cli')}
            />

            {/* Connection labels */}
            <div
              className="absolute text-xs text-purple-400/70 pointer-events-none"
              style={{
                left: (positions.sdk.x + positions.daemon.x) / 2,
                top: positions.sdk.y - 20,
                transform: 'translateX(-50%)',
              }}
            >
              messages
            </div>
            <div
              className="absolute text-xs text-emerald-400/70 pointer-events-none"
              style={{
                left: (positions.mcp.x + positions.daemon.x) / 2,
                top: positions.mcp.y - 20,
                transform: 'translateX(-50%)',
              }}
            >
              MCP tools
            </div>
            <div
              className="absolute text-xs text-slate-400/70 pointer-events-none"
              style={{
                left: positions.cli.x + 60,
                top: (positions.cli.y + positions.daemon.y) / 2,
              }}
            >
              commands
            </div>
          </div>
        </div>

        {/* Legend and info */}
        <div className="space-y-4">
          <Legend />
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
              How It Works
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Daemon acts as the central message broker. Agents connect via the SDK,
              AI models interface through MCP tools, and operators manage everything
              using the CLI. All communication flows through the Daemon for routing
              and delivery.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
              Interaction
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click on any component in the diagram to view detailed information
              about its role, features, and how it integrates with the relay system.
            </p>
          </div>
        </div>
      </div>

      {/* Info modal */}
      <AnimatePresence>
        {selectedComponent && (
          <InfoModal
            info={selectedComponent}
            onClose={() => setSelectedComponent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
