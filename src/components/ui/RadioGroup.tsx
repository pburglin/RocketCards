import React from 'react'

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`grid gap-2 ${className}`}
      role="radiogroup"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onCheckedChange: () => onValueChange(child.props.value)
          } as any)
        }
        return child
      })}
    </div>
  )
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, checked, onCheckedChange, ...props }, ref) => (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={value}
        ref={ref}
        checked={checked}
        onChange={(e) => {
          if (e.target.checked && onCheckedChange) {
            onCheckedChange(true)
          }
        }}
        className="w-4 h-4 text-primary border-border rounded-full focus:ring-primary"
        value={value}
        {...props}
      />
    </div>
  )
)
RadioGroupItem.displayName = "RadioGroupItem"
