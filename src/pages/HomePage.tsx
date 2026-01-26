export function HomePage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">
        Agent Relay Visualizer
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
        Interactive visualization of the Agent Relay system. Explore the
        architecture, see how messages flow between agents, and learn how to use
        the SDK.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <FeatureCard
          title="Architecture"
          description="Explore the components of the Agent Relay system"
          href="/architecture"
        />
        <FeatureCard
          title="Message Flow"
          description="See how messages travel between agents"
          href="/message-flow"
        />
        <FeatureCard
          title="Multi-Agent Demo"
          description="Interactive simulation of agent communication"
          href="/multi-agent"
        />
        <FeatureCard
          title="Code Examples"
          description="Learn how to use the SDK with examples"
          href="/code-examples"
        />
        <FeatureCard
          title="Dashboard"
          description="View the live relay dashboard"
          href="/dashboard"
        />
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
    >
      <h3 className="text-xl font-semibold text-slate-50 mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </a>
  )
}
