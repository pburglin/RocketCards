import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md',
    isLoading = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-button font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    
    const variantClasses = {
      primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
      secondary: "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",
      accent: "bg-accent text-white hover:bg-accent-dark focus:ring-accent",
      outline: "border border-border bg-transparent text-text hover:bg-surface-light focus:ring-primary",
      ghost: "bg-transparent text-text hover:bg-surface-light focus:ring-primary"
    }
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    }
    
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Loading...
          </div>
        ) : children}
      </button>
    )
  }
)
Button.displayName = "Button"
