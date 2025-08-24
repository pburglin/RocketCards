import { CheckCircle, User, Layout, Gamepad2 } from 'lucide-react'

interface SetupProgressIndicatorProps {
  currentStep: 'profile' | 'deck' | 'play'
  hasProfile: boolean
  hasDeck: boolean
}

export default function SetupProgressIndicator({ currentStep, hasProfile, hasDeck }: SetupProgressIndicatorProps) {
  const steps = [
    { id: 'profile', label: 'Create Player Profile', icon: User },
    { id: 'deck', label: 'Create a Deck', icon: Layout },
    { id: 'play', label: 'Play', icon: Gamepad2 }
  ]

  const getStepStatus = (stepId: string) => {
    if (stepId === 'profile') {
      return hasProfile ? 'completed' : currentStep === 'profile' ? 'current' : 'pending'
    }
    if (stepId === 'deck') {
      if (hasDeck) return 'completed'
      if (hasProfile && currentStep === 'deck') return 'current'
      return 'pending'
    }
    if (stepId === 'play') {
      if (hasProfile && hasDeck) return 'completed'
      if (hasProfile && hasDeck && currentStep === 'play') return 'current'
      return 'pending'
    }
    return 'pending'
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isCompleted = status === 'completed'
          const isCurrent = status === 'current'
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted 
                    ? 'bg-primary text-white' 
                    : isCurrent 
                      ? 'bg-primary/20 text-primary border-2 border-primary' 
                      : 'bg-surface-light text-text-secondary'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm font-medium text-center ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-text' : 'text-text-secondary'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4">
                  <div className={`h-full ${
                    getStepStatus(steps[index + 1].id) !== 'pending' 
                      ? 'bg-primary' 
                      : 'bg-surface-light'
                  }`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}