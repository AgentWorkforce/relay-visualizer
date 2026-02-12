import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ──────────────────────────────────────────────────────────────────

interface RelayMessage {
  id: string
  agent_name: string
  text: string
  created_at: string
  reply_count: number
  reactions: Array<{ emoji: string; count: number }>
}

interface AgentStyle {
  bg: string
  border: string
  text: string
  dot: string
}

// ── Agent color mapping ────────────────────────────────────────────────────

const COLORS: Record<string, AgentStyle> = {
  orchestrator: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd', dot: '#3b82f6' },
  architect:    { bg: '#3b1f6e', border: '#8b5cf6', text: '#c4b5fd', dot: '#8b5cf6' },
  builder:      { bg: '#064e3b', border: '#10b981', text: '#6ee7b7', dot: '#10b981' },
  other:        { bg: '#78350f', border: '#f59e0b', text: '#fcd34d', dot: '#f59e0b' },
}

function agentRole(name: string): string {
  const lower = name.toLowerCase()
  if (lower.startsWith('ralph') || lower.startsWith('orchestrator') || lower.startsWith('system')) return 'orchestrator'
  if (lower.startsWith('architect') || lower.startsWith('planner') || lower.startsWith('reviewer') || lower.includes('claude')) return 'architect'
  if (lower.startsWith('builder') || lower.includes('codex')) return 'builder'
  return 'other'
}

function getStyle(name: string): AgentStyle {
  return COLORS[agentRole(name)]!
}

// ── Badge detection ────────────────────────────────────────────────────────

interface Badge {
  label: string
  color: string
  bg: string
}

function detectBadge(text: string): Badge | null {
  if (text.includes('REVIEW:PASS')) return { label: 'REVIEW:PASS', color: '#6ee7b7', bg: '#064e3b' }
  if (text.includes('REVIEW:FAIL')) return { label: 'REVIEW:FAIL', color: '#fca5a5', bg: '#7f1d1d' }
  if (text.includes('IMPLEMENTATION COMPLETE')) return { label: 'COMPLETE', color: '#6ee7b7', bg: '#064e3b' }
  return null
}

// ── Phase detection ────────────────────────────────────────────────────────

function detectPhase(text: string): string | null {
  const match = text.match(/^## (?:Architect|Builder|Plan|Implement|Review):\s*(.+)/m)
  if (match) return match[1]!.trim()
  return null
}

// ── Time formatting ────────────────────────────────────────────────────────

function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function durationStr(messages: RelayMessage[]): string {
  if (messages.length < 2) return ''
  const first = new Date(messages[0]!.created_at).getTime()
  const last = new Date(messages[messages.length - 1]!.created_at).getTime()
  const mins = Math.round((last - first) / 60000)
  if (mins < 1) return '< 1 min'
  return `${mins} min`
}

// ── API constants ──────────────────────────────────────────────────────────

const API_BASE = 'https://api.relaycast.dev'

// ── Component ──────────────────────────────────────────────────────────────

export function TranscriptPage() {
  const [apiKey, setApiKey] = useState('')
  const [channel, setChannel] = useState('general')
  const [limit, setLimit] = useState(100)
  const [messages, setMessages] = useState<RelayMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const timelineRef = useRef<HTMLDivElement>(null)

  const fetchTranscript = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }

    setLoading(true)
    setError(null)
    setMessages([])

    try {
      // 1. Register a temporary agent to get an agent token
      const regRes = await fetch(`${API_BASE}/v1/agents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `viz-${Date.now().toString(36)}`,
          type: 'agent',
        }),
      })

      if (!regRes.ok) {
        const body = await regRes.text()
        throw new Error(`Agent registration failed (${regRes.status}): ${body}`)
      }

      const regData = await regRes.json()
      const agentToken = regData.data?.token
      if (!agentToken) {
        throw new Error('No agent token in registration response')
      }

      // 2. Fetch agents list to build id→name map
      const agentsRes = await fetch(`${API_BASE}/v1/agents`, {
        headers: { 'Authorization': `Bearer ${apiKey.trim()}` },
      })
      const agentMap = new Map<string, string>()
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json()
        for (const a of agentsData.data ?? []) {
          agentMap.set(a.id, a.name)
        }
      }

      // 3. Fetch messages from the channel
      const params = new URLSearchParams({ limit: String(limit) })
      const msgRes = await fetch(
        `${API_BASE}/v1/channels/${encodeURIComponent(channel.trim())}/messages?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${agentToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!msgRes.ok) {
        const body = await msgRes.text()
        throw new Error(`Failed to fetch messages (${msgRes.status}): ${body}`)
      }

      const msgData = await msgRes.json()
      const raw: RelayMessage[] = (msgData.data ?? []).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        agent_name: agentMap.get(m.agent_id as string) ?? (m.agent_name as string) ?? 'unknown',
        text: (m.text as string) ?? '',
        created_at: (m.created_at as string) ?? '',
        reply_count: (m.reply_count as number) ?? 0,
        reactions: (m.reactions as Array<{ emoji: string; count: number }>) ?? [],
      }))

      // Messages come newest-first from the API, reverse to chronological
      raw.reverse()
      setMessages(raw)

      // Scroll to timeline after a tick
      setTimeout(() => {
        timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [apiKey, channel, limit])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Compute stats
  const agents = [...new Set(messages.map((m) => m.agent_name))]
  const seenPhases = new Set<string>()
  for (const m of messages) {
    const phase = detectPhase(m.text)
    if (phase) seenPhases.add(phase)
  }
  const stats = [
    seenPhases.size > 0 ? `${seenPhases.size} stories` : null,
    `${messages.length} messages`,
    `${agents.length} agents`,
    durationStr(messages) || null,
  ].filter(Boolean).join(' \u00b7 ')

  let lastPhase = ''

  return (
    <div>
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
          Relaycast Transcript
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Fetch and visualize agent message history from a Relaycast channel.
          Enter your workspace API key and channel name to get started.
        </p>
      </header>

      {/* Input form */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label htmlFor="api-key" className="block text-sm font-medium text-slate-300 mb-1.5">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="rk_live_..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="channel" className="block text-sm font-medium text-slate-300 mb-1.5">
              Channel
            </label>
            <input
              id="channel"
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="general"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="limit" className="block text-sm font-medium text-slate-300 mb-1.5">
              Limit
            </label>
            <input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 100)}
              min={1}
              max={500}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={fetchTranscript}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-md text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Timeline */}
      {messages.length > 0 && (
        <motion.div
          ref={timelineRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Stats header */}
          <div className="text-center mb-6">
            <div className="text-blue-400 text-sm font-medium">#{channel}</div>
            <div className="text-slate-500 text-xs mt-1">{stats}</div>
          </div>

          {/* Agent legend */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {agents.map((name) => {
              const style = getStyle(name)
              return (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: style.dot }}
                  />
                  {name}
                </span>
              )
            })}
          </div>

          {/* Messages */}
          <div className="space-y-1">
            <AnimatePresence>
              {messages.map((m, i) => {
                const style = getStyle(m.agent_name)
                const badge = detectBadge(m.text)
                const phase = detectPhase(m.text)
                const time = formatTime(m.created_at)
                const isLong = m.text.length > 300
                const isExpanded = expandedIds.has(m.id)
                const displayText = isLong && !isExpanded
                  ? m.text.slice(0, 280) + '...'
                  : m.text

                let phaseHeader = null
                if (phase && phase !== lastPhase) {
                  lastPhase = phase
                  phaseHeader = (
                    <div className="flex items-center gap-3 my-5 pl-5">
                      <div className="flex-1 h-px bg-slate-700" />
                      <span className="text-slate-100 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                        {phase}
                      </span>
                      <div className="flex-1 h-px bg-slate-700" />
                    </div>
                  )
                }

                return (
                  <div key={m.id}>
                    {phaseHeader}
                    <motion.div
                      className="relative pl-10"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute left-[14px] top-[18px] w-3 h-3 rounded-full z-10"
                        style={{
                          background: style.dot,
                          boxShadow: `0 0 8px ${style.dot}`,
                        }}
                      />
                      {/* Timeline line */}
                      {i < messages.length - 1 && (
                        <div className="absolute left-[19px] top-[30px] bottom-[-4px] w-0.5 bg-slate-800" />
                      )}
                      {/* Card */}
                      <div
                        className="bg-slate-800 border rounded-lg px-4 py-3 hover:border-slate-500 transition-colors"
                        style={{ borderColor: `${style.border}40` }}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-semibold text-xs" style={{ color: style.text }}>
                            {m.agent_name}
                          </span>
                          {badge && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                              style={{ color: badge.color, background: badge.bg }}
                            >
                              {badge.label}
                            </span>
                          )}
                          {m.reactions.length > 0 && (
                            <span className="text-[10px] text-slate-500">
                              {m.reactions.map((r) => `${r.emoji} ${r.count}`).join(' ')}
                            </span>
                          )}
                          <span className="text-slate-600 text-[11px] ml-auto tabular-nums">
                            {time}
                          </span>
                        </div>
                        {/* Body */}
                        <div className="text-slate-300 text-xs whitespace-pre-wrap break-words leading-relaxed">
                          {displayText}
                        </div>
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(m.id)}
                            className="text-blue-400 text-[11px] mt-1 hover:underline bg-transparent border-none cursor-pointer p-0"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-600 text-xs mt-10 pt-6 border-t border-slate-800">
            Generated by{' '}
            <a
              href="https://github.com/AgentWorkforce/relay-broker"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              agent-relay
            </a>
          </div>
        </motion.div>
      )}
    </div>
  )
}
