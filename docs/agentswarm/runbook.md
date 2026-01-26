# AgentSwarm Runbook

## Dashboard
AgentRelay dashboard: http://localhost:3888

## State
Local runtime state is in .agentswarm/ (not meant to be committed).
Project knowledge is in docs/agentswarm/ (safe to commit).

## Stopping
- Stop AgentRelay daemon:
  agent-relay down

If the Conductor is still running, it will fail to send/receive messages.
Restart with:
  agent-relay up
  AgentSwarm --resume
