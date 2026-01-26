# AgentSwarm Protocol

This repo is being developed by autonomous agents orchestrated by AgentSwarm + AgentRelay.

## Where truth lives
- docs/agentswarm/plan.md
- docs/agentswarm/backlog.json
- docs/agentswarm/handoff/
- docs/agentswarm/reports/

Agents MUST write files above for continuity.

## Status messages (required format)

Agents must send status to the Conductor using a raw text block:

<AGENTSWARM_MESSAGE>
TYPE: ...
...
</AGENTSWARM_MESSAGE>

Supported TYPE values:
- PLANNER_DONE
- TASK_DONE
- TASK_BLOCKED
- JUDGE_VERDICT

## Log-driven debugging expectation
If uncertain: add logs, run, observe logs, iterate.

## Definition of done (for tasks)
A task is done only when:
- acceptance criteria are met
- verification steps run successfully
- changes are committed on the task branch
- completion report written to docs/agentswarm/reports/
