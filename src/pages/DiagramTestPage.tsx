import { useState } from 'react'
import {
  ComponentNode,
  ConnectionLine,
  MessageBubble,
  MessagePulse,
  EnvelopeIcon,
  getConnectionPath,
} from '../components/diagrams'

// Define node positions
const nodes = {
  agent1: { x: 150, y: 150 },
  daemon: { x: 400, y: 150 },
  agent2: { x: 650, y: 150 },
  sdk: { x: 275, y: 300 },
  mcp: { x: 525, y: 300 },
}

export function DiagramTestPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState(true)

  // Generate path for message bubble
  const messagePath = getConnectionPath(nodes.agent1, nodes.daemon, false)
  const curvedPath = getConnectionPath(nodes.daemon, nodes.agent2, true)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Diagram Components Test</h1>
        <p className="text-slate-400">
          Interactive test page for the reusable diagram components.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowMessage(prev => !prev)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          {showMessage ? 'Hide' : 'Show'} Message Animation
        </button>
        <button
          onClick={() => setSelectedNode(null)}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
        >
          Clear Selection
        </button>
      </div>

      {/* Selection info */}
      {selectedNode && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Selected Node:</p>
          <p className="text-lg font-semibold text-blue-400">{selectedNode}</p>
        </div>
      )}

      {/* Main diagram area */}
      <div className="relative bg-slate-800/50 rounded-xl border border-slate-700 h-[450px] overflow-hidden">
        {/* Connection Lines */}
        <ConnectionLine
          start={nodes.agent1}
          end={nodes.daemon}
          animated
          color="#3b82f6"
          animationDuration={1.5}
        />
        <ConnectionLine
          start={nodes.daemon}
          end={nodes.agent2}
          animated
          curved
          color="#8b5cf6"
          animationDuration={2}
        />
        <ConnectionLine
          start={nodes.sdk}
          end={nodes.daemon}
          animated={false}
          color="#64748b"
        />
        <ConnectionLine
          start={nodes.mcp}
          end={nodes.daemon}
          animated={false}
          curved
          color="#64748b"
        />

        {/* Message Bubbles */}
        {showMessage && (
          <>
            <MessageBubble
              path={messagePath}
              duration={2}
              color="#3b82f6"
              size="md"
              icon={<EnvelopeIcon className="w-full h-full" />}
            />
            <MessageBubble
              path={curvedPath}
              duration={2.5}
              delay={1}
              color="#8b5cf6"
              size="sm"
            />
          </>
        )}

        {/* Component Nodes */}
        <ComponentNode
          label="Agent 1"
          position={nodes.agent1}
          variant="primary"
          size="lg"
          onClick={() => setSelectedNode('Agent 1')}
          icon={<AgentIcon />}
        />
        <ComponentNode
          label="Relay Daemon"
          position={nodes.daemon}
          variant="accent"
          size="lg"
          onClick={() => setSelectedNode('Relay Daemon')}
          icon={<DaemonIcon />}
        />
        <ComponentNode
          label="Agent 2"
          position={nodes.agent2}
          variant="primary"
          size="lg"
          onClick={() => setSelectedNode('Agent 2')}
          icon={<AgentIcon />}
        />
        <ComponentNode
          label="SDK"
          position={nodes.sdk}
          variant="secondary"
          size="md"
          onClick={() => setSelectedNode('SDK')}
        />
        <ComponentNode
          label="MCP Server"
          position={nodes.mcp}
          variant="default"
          size="md"
          onClick={() => setSelectedNode('MCP Server')}
        />

        {/* Message Pulse Demo */}
        <MessagePulse
          position={{ x: 400, y: 380 }}
          color="#10b981"
          size="lg"
        />
      </div>

      {/* Component showcase sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ComponentNode variants */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-4">ComponentNode Variants</h2>
          <div className="relative h-48">
            <ComponentNode label="Default" position={{ x: 70, y: 40 }} variant="default" size="sm" />
            <ComponentNode label="Primary" position={{ x: 70, y: 100 }} variant="primary" size="sm" />
            <ComponentNode label="Secondary" position={{ x: 70, y: 160 }} variant="secondary" size="sm" />
            <ComponentNode label="Accent" position={{ x: 180, y: 100 }} variant="accent" size="sm" />
          </div>
        </div>

        {/* ConnectionLine styles */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-4">ConnectionLine Styles</h2>
          <div className="relative h-48">
            <ConnectionLine
              start={{ x: 30, y: 40 }}
              end={{ x: 220, y: 40 }}
              animated={false}
              color="#64748b"
            />
            <ConnectionLine
              start={{ x: 30, y: 90 }}
              end={{ x: 220, y: 90 }}
              animated
              color="#3b82f6"
            />
            <ConnectionLine
              start={{ x: 30, y: 140 }}
              end={{ x: 220, y: 140 }}
              animated
              curved
              color="#8b5cf6"
            />
            <ConnectionLine
              start={{ x: 30, y: 190 }}
              end={{ x: 220, y: 190 }}
              animated
              color="#10b981"
              strokeWidth={3}
              dashArray="4,8"
            />
            <div className="absolute left-0 top-7 text-xs text-slate-400">Static</div>
            <div className="absolute left-0 top-[77px] text-xs text-slate-400">Animated</div>
            <div className="absolute left-0 top-[127px] text-xs text-slate-400">Curved</div>
            <div className="absolute left-0 top-[177px] text-xs text-slate-400">Custom</div>
          </div>
        </div>

        {/* MessageBubble sizes */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-4">MessageBubble Sizes</h2>
          <div className="relative h-48">
            <MessageBubble
              path="M 30 60 L 220 60"
              duration={2}
              color="#3b82f6"
              size="sm"
            />
            <MessageBubble
              path="M 30 120 L 220 120"
              duration={2.5}
              color="#8b5cf6"
              size="md"
              delay={0.5}
            />
            <MessageBubble
              path="M 30 180 L 220 180"
              duration={3}
              color="#10b981"
              size="lg"
              delay={1}
              icon={<EnvelopeIcon className="w-full h-full" />}
            />
            <div className="absolute left-0 top-12 text-xs text-slate-400">Small</div>
            <div className="absolute left-0 top-[108px] text-xs text-slate-400">Medium</div>
            <div className="absolute left-0 top-[168px] text-xs text-slate-400">Large</div>
          </div>
        </div>
      </div>

      {/* Performance note */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="font-semibold text-slate-200 mb-2">Performance Testing</h3>
        <p className="text-sm text-slate-400">
          Open browser DevTools &rarr; Performance tab &rarr; Record while viewing this page.
          All animations should run at 60fps without jank. Framer Motion uses hardware
          acceleration for transforms and opacity.
        </p>
      </div>
    </div>
  )
}

// Simple icon components for demo
function AgentIcon() {
  return (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function DaemonIcon() {
  return (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
        clipRule="evenodd"
      />
    </svg>
  )
}
