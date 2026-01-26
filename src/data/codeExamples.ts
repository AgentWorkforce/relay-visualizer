import type { CodeExample } from '../components/code/CodeTabs'

export const codeExamples: CodeExample[] = [
  {
    id: 'initialization',
    title: 'Initialization',
    description:
      'Initialize the Agent Relay SDK by creating a client instance. The client automatically connects to the relay daemon and registers your agent.',
    filename: 'setup.ts',
    code: `import { AgentRelay } from '@anthropic/agent-relay'

// Create a new Agent Relay client
const relay = new AgentRelay({
  agentId: 'my-agent',
  daemonUrl: 'ws://localhost:3888',
  // Optional: Add metadata about your agent
  metadata: {
    name: 'My Agent',
    version: '1.0.0',
    capabilities: ['code-review', 'testing'],
  },
})

// Connect to the relay daemon
await relay.connect()

console.log('Connected to Agent Relay!')
console.log('Agent ID:', relay.agentId)

// Clean up when done
process.on('SIGINT', async () => {
  await relay.disconnect()
  process.exit(0)
})`,
  },
  {
    id: 'send-message',
    title: 'Send Message',
    description:
      'Send direct messages to other agents using their agent ID. Messages are delivered through the relay daemon with guaranteed delivery.',
    filename: 'sendMessage.ts',
    code: `import { AgentRelay } from '@anthropic/agent-relay'

const relay = new AgentRelay({ agentId: 'sender-agent' })
await relay.connect()

// Send a simple text message
await relay.send({
  to: 'target-agent',
  content: 'Hello from sender-agent!',
})

// Send a structured message with metadata
await relay.send({
  to: 'worker-agent',
  content: {
    type: 'task',
    action: 'process-file',
    payload: {
      filePath: '/data/input.json',
      outputFormat: 'csv',
    },
  },
  // Optional: Add a thread ID for conversation tracking
  thread: 'task-123',
  // Optional: Set message priority
  priority: 'high',
})

// Send with acknowledgment confirmation
const ack = await relay.send({
  to: 'critical-agent',
  content: 'Important update',
  waitForAck: true,
  timeout: 5000, // 5 second timeout
})

console.log('Message acknowledged at:', ack.timestamp)`,
  },
  {
    id: 'receive-message',
    title: 'Receive Message',
    description:
      'Listen for incoming messages from other agents. Set up message handlers to process different types of messages.',
    filename: 'receiveMessage.ts',
    code: `import { AgentRelay, Message } from '@anthropic/agent-relay'

const relay = new AgentRelay({ agentId: 'receiver-agent' })
await relay.connect()

// Handle all incoming messages
relay.onMessage((message: Message) => {
  console.log('Received message from:', message.from)
  console.log('Content:', message.content)
  console.log('Thread:', message.thread)

  // Acknowledge receipt (if sender requested)
  if (message.requiresAck) {
    message.acknowledge()
  }
})

// Handle messages from a specific agent
relay.onMessageFrom('sender-agent', (message: Message) => {
  console.log('Got message from sender-agent:', message.content)
})

// Handle messages with specific content types
relay.onMessage((message: Message) => {
  if (message.content.type === 'task') {
    handleTask(message.content.payload)
  } else if (message.content.type === 'query') {
    handleQuery(message)
  }
})

// Handle connection events
relay.onConnect(() => console.log('Connected!'))
relay.onDisconnect(() => console.log('Disconnected!'))
relay.onError((error) => console.error('Error:', error))`,
  },
  {
    id: 'broadcast',
    title: 'Broadcast',
    description:
      'Broadcast messages to all connected agents simultaneously. Useful for announcements, status updates, or coordinating multiple agents.',
    filename: 'broadcast.ts',
    code: `import { AgentRelay } from '@anthropic/agent-relay'

const relay = new AgentRelay({ agentId: 'coordinator' })
await relay.connect()

// Broadcast to all connected agents
await relay.broadcast({
  content: {
    type: 'announcement',
    message: 'System maintenance in 5 minutes',
    severity: 'warning',
  },
})

// Broadcast with filtering by agent metadata
await relay.broadcast({
  content: {
    type: 'task-available',
    taskId: 'task-456',
    requirements: ['code-review'],
  },
  // Only send to agents with matching capabilities
  filter: {
    capabilities: { includes: 'code-review' },
  },
})

// Listen for broadcasts from other agents
relay.onBroadcast((message) => {
  console.log('Broadcast from:', message.from)
  console.log('Content:', message.content)

  if (message.content.type === 'task-available') {
    // Check if we can handle this task
    const canHandle = checkCapabilities(message.content.requirements)
    if (canHandle) {
      claimTask(message.content.taskId)
    }
  }
})`,
  },
  {
    id: 'channels',
    title: 'Channels',
    description:
      'Subscribe to named channels for topic-based messaging. Channels allow agents to communicate in groups based on shared interests or responsibilities.',
    filename: 'channels.ts',
    code: `import { AgentRelay } from '@anthropic/agent-relay'

const relay = new AgentRelay({ agentId: 'team-member' })
await relay.connect()

// Subscribe to a channel
await relay.subscribe('#code-review')
await relay.subscribe('#deployments')
await relay.subscribe('#alerts')

// Send a message to a channel
await relay.send({
  to: '#code-review',
  content: {
    type: 'review-request',
    pr: 'https://github.com/org/repo/pull/123',
    author: 'team-member',
    urgency: 'normal',
  },
})

// Listen for channel messages
relay.onChannelMessage('#code-review', (message) => {
  console.log('Code review message:', message.content)

  if (message.content.type === 'review-request') {
    // Handle review request
    startCodeReview(message.content.pr)
  }
})

// Unsubscribe when no longer needed
await relay.unsubscribe('#deployments')

// List current subscriptions
const channels = relay.getSubscribedChannels()
console.log('Subscribed to:', channels)
// Output: ['#code-review', '#alerts']`,
  },
]
