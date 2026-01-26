import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ComponentNode,
  ConnectionLine,
  Position,
} from '../components/diagrams'

// Icon components for the nodes
function AgentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function SdkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function DaemonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// Control button icons
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// Step descriptions for the message flow
const flowSteps = [
  {
    step: 1,
    title: 'Agent A Sends Message',
    description: 'Agent A creates a message and sends it via the SDK.',
    from: 0,
    to: 1,
  },
  {
    step: 2,
    title: 'SDK Forwards to Daemon',
    description: 'The sender SDK packages the message and forwards it to the Relay Daemon.',
    from: 1,
    to: 2,
  },
  {
    step: 3,
    title: 'Daemon Routes Message',
    description: 'The Relay Daemon routes the message to the appropriate recipient SDK.',
    from: 2,
    to: 3,
  },
  {
    step: 4,
    title: 'Receiver SDK Gets Message',
    description: 'The receiver SDK receives the message from the Daemon.',
    from: 3,
    to: 4,
  },
  {
    step: 5,
    title: 'Agent B Receives Message',
    description: 'Agent B receives and processes the message from its SDK.',
    from: 4,
    to: 4, // Final step - message is at Agent B
  },
]

// Animation durations
const STEP_DURATION = 1500 // Duration for each step in ms

export function MessageFlowPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // 0 = initial state, 1-5 = steps
  const [animationProgress, setAnimationProgress] = useState(0) // 0 to 1 for each step
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(900)

  // Track container width for responsive layout
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Node positions (centered in container, responsive)
  const containerHeight = 300
  const nodeSpacing = containerWidth / 6
  const centerY = containerHeight / 2

  const nodePositions: Position[] = [
    { x: nodeSpacing, y: centerY }, // Agent A
    { x: nodeSpacing * 2, y: centerY }, // SDK (sender)
    { x: nodeSpacing * 3, y: centerY }, // Daemon
    { x: nodeSpacing * 4, y: centerY }, // SDK (receiver)
    { x: nodeSpacing * 5, y: centerY }, // Agent B
  ]

  const nodeLabels = ['Agent A', 'SDK', 'Daemon', 'SDK', 'Agent B']
  const nodeSublabels = ['', '(Sender)', '', '(Receiver)', '']
  const nodeVariants: ('primary' | 'secondary' | 'accent')[] = [
    'primary',
    'secondary',
    'accent',
    'secondary',
    'primary',
  ]
  const nodeIcons = [
    <AgentIcon className="w-full h-full" />,
    <SdkIcon className="w-full h-full" />,
    <DaemonIcon className="w-full h-full" />,
    <SdkIcon className="w-full h-full" />,
    <AgentIcon className="w-full h-full" />,
  ]

  // Reset function
  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    setAnimationProgress(0)
  }, [])

  // Play/Pause toggle
  const handlePlayPause = useCallback(() => {
    if (currentStep === 5 && animationProgress >= 1) {
      // If animation completed, reset and play
      setCurrentStep(1)
      setAnimationProgress(0)
      setIsPlaying(true)
    } else if (currentStep === 0) {
      // Start from beginning
      setCurrentStep(1)
      setAnimationProgress(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((prev) => !prev)
    }
  }, [currentStep, animationProgress])

  // Animation loop
  useEffect(() => {
    if (!isPlaying || currentStep === 0) return

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        const newProgress = prev + 0.05 // Increment progress

        if (newProgress >= 1) {
          // Step complete, move to next step
          if (currentStep < 5) {
            setCurrentStep((s) => s + 1)
            return 0
          } else {
            // Animation complete
            setIsPlaying(false)
            return 1
          }
        }
        return newProgress
      })
    }, STEP_DURATION / 20) // Update ~20 times per step

    return () => clearInterval(interval)
  }, [isPlaying, currentStep])

  // Calculate message bubble position
  const getMessagePosition = (): Position | null => {
    if (currentStep === 0) return null

    const step = flowSteps[currentStep - 1]
    if (!step) return null

    const fromPos = nodePositions[step.from]
    const toPos = nodePositions[step.to]
    if (!fromPos || !toPos) return null

    // Interpolate position
    const x = fromPos.x + (toPos.x - fromPos.x) * animationProgress
    const y = fromPos.y + (toPos.y - fromPos.y) * animationProgress

    return { x, y }
  }

  const messagePosition = getMessagePosition()

  // Get current step info
  const currentStepInfo = currentStep > 0 ? flowSteps[currentStep - 1] : null

  return (
    <div>
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
          Message Flow Visualization
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Watch how a message travels through the Agent Relay system from one agent
          to another. Use the controls to play, pause, or reset the animation.
        </p>
      </header>

      {/* Main diagram container */}
      <div
        ref={containerRef}
        className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 md:p-6 mb-6"
        role="img"
        aria-label="Message flow diagram showing the path a message takes from Agent A through SDK, Daemon, SDK, to Agent B"
        aria-live="polite"
      >
        <div
          className="relative mx-auto w-full overflow-x-auto"
          style={{ minWidth: '300px', height: containerHeight }}
        >
          {/* Connection lines */}
          {nodePositions.slice(0, -1).map((pos, i) => {
            const nextPos = nodePositions[i + 1]
            if (!nextPos) return null
            return (
              <ConnectionLine
                key={i}
                start={pos}
                end={nextPos}
                animated={isPlaying && currentStep === i + 1}
                color={
                  currentStep > i + 1
                    ? '#10b981' // Green for completed
                    : currentStep === i + 1
                      ? '#3b82f6' // Blue for current
                      : '#475569' // Gray for upcoming
                }
                strokeWidth={3}
                dashArray="8,4"
                animationDuration={1}
              />
            )
          })}

          {/* Nodes */}
          {nodePositions.map((pos, i) => {
            const label = nodeLabels[i] ?? ''
            const sublabel = nodeSublabels[i] ?? ''
            const icon = nodeIcons[i]
            const variant = nodeVariants[i] ?? 'primary'
            return (
              <div key={i}>
                <ComponentNode
                  label={label}
                  icon={icon}
                  position={pos}
                  variant={variant}
                  size="sm"
                  ariaLabel={`${label} ${sublabel}`.trim()}
                />
                {/* Sublabel - hidden on very small screens */}
                {sublabel && (
                  <div
                    className="absolute text-[10px] md:text-xs text-slate-400 text-center w-16 md:w-24 -translate-x-1/2 hidden sm:block"
                    style={{ left: pos.x, top: pos.y + 40 }}
                    aria-hidden="true"
                  >
                    {sublabel}
                  </div>
                )}
              </div>
            )
          })}

          {/* Message bubble */}
          <AnimatePresence>
            {messagePosition && currentStep > 0 && currentStep <= 4 && (
              <motion.div
                className="absolute z-20"
                style={{
                  left: messagePosition.x,
                  top: messagePosition.y - 50,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              >
                <motion.div
                  className="relative"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Message envelope */}
                  <div className="w-8 h-6 md:w-10 md:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md shadow-lg border-2 border-white flex items-center justify-center">
                    <svg
                      className="w-4 h-3 md:w-5 md:h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 16"
                      aria-hidden="true"
                    >
                      <path d="M0 2a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm2 0l8 5 8-5H2zm16 1.5l-8 5-8-5V14h16V3.5z" />
                    </svg>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-blue-500 rounded-md blur-md opacity-50 -z-10" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion indicator */}
          <AnimatePresence>
            {currentStep === 5 && animationProgress >= 0.9 && nodePositions[4] && (
              <motion.div
                className="absolute z-20"
                style={{
                  left: nodePositions[4].x,
                  top: nodePositions[4].y - 70,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 bg-emerald-600/90 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium shadow-lg">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delivered!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls and step indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Controls */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Controls</h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              aria-pressed={isPlaying}
              aria-label={isPlaying ? 'Pause animation' : (currentStep === 5 && animationProgress >= 1 ? 'Replay animation' : 'Play animation')}
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Pause</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">{currentStep === 5 && animationProgress >= 1 ? 'Replay' : 'Play'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
              aria-label="Reset animation to beginning"
            >
              <ResetIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Reset</span>
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Step Progress</h2>
          <div className="flex items-center gap-1 md:gap-2 mb-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={5} aria-label="Animation progress">
            {flowSteps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full font-medium text-xs md:text-sm transition-all ${
                  currentStep > step.step
                    ? 'bg-emerald-600 text-white'
                    : currentStep === step.step
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1 md:ring-offset-2 ring-offset-slate-800'
                      : 'bg-slate-700 text-slate-400'
                }`}
                aria-label={`Step ${step.step}${currentStep > step.step ? ' complete' : currentStep === step.step ? ' in progress' : ''}`}
              >
                {currentStep > step.step ? (
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.step
                )}
              </div>
            ))}
          </div>
          <div className="min-h-[60px]" aria-live="polite">
            {currentStepInfo ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-slate-100 font-medium mb-1 text-sm md:text-base">
                  Step {currentStepInfo.step}: {currentStepInfo.title}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm">{currentStepInfo.description}</p>
              </motion.div>
            ) : (
              <p className="text-slate-500 text-xs md:text-sm">
                Click Play to start the message flow animation.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step breakdown */}
      <section className="mt-6 bg-slate-800/50 rounded-lg border border-slate-700 p-4 md:p-6" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-lg font-semibold text-slate-200 mb-4">
          Message Flow Steps
        </h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 list-none p-0 m-0">
          {flowSteps.map((step, i) => (
            <li
              key={i}
              className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                currentStep === step.step
                  ? 'border-blue-500 bg-blue-900/20'
                  : currentStep > step.step
                    ? 'border-emerald-500/50 bg-emerald-900/10'
                    : 'border-slate-700 bg-slate-800/50'
              }`}
            >
              <div
                className={`text-[10px] md:text-xs font-semibold mb-2 ${
                  currentStep === step.step
                    ? 'text-blue-400'
                    : currentStep > step.step
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                }`}
              >
                STEP {step.step}
              </div>
              <div
                className={`font-medium mb-1 text-xs md:text-sm ${
                  currentStep >= step.step ? 'text-slate-200' : 'text-slate-400'
                }`}
              >
                {step.title}
              </div>
              <p
                className={`text-[10px] md:text-xs ${
                  currentStep >= step.step ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
