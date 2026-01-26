import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="text-center py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-500 mb-4">
        Agent Relay Visualizer
      </h1>
      <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-8 px-4">
        Interactive visualization of the Agent Relay system. Explore the
        architecture, see how messages flow between agents, and learn how to use
        the SDK.
      </p>
      <nav aria-label="Feature navigation">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 list-none p-0 m-0">
          <li>
            <FeatureCard
              title="Architecture"
              description="Explore the components of the Agent Relay system"
              href="/architecture"
            />
          </li>
          <li>
            <FeatureCard
              title="Message Flow"
              description="See how messages travel between agents"
              href="/message-flow"
            />
          </li>
          <li>
            <FeatureCard
              title="Multi-Agent Demo"
              description="Interactive simulation of agent communication"
              href="/multi-agent"
            />
          </li>
          <li>
            <FeatureCard
              title="Code Examples"
              description="Learn how to use the SDK with examples"
              href="/code-examples"
            />
          </li>
          <li>
            <FeatureCard
              title="Dashboard"
              description="View the live relay dashboard"
              href="/dashboard"
            />
          </li>
        </ul>
      </nav>
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
    <Link
      to={href}
      className="block p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      <h2 className="text-xl font-semibold text-slate-50 mb-2">{title}</h2>
      <p className="text-slate-400">{description}</p>
    </Link>
  )
}
