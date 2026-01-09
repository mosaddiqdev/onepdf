import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: string
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, suffix, ...props }, ref) => {
    if (suffix) {
      return (
        <div className="flex rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-transparent transition-all duration-200">
          <input
            ref={ref}
            className={cn(
              'flex-1 h-10 sm:h-11 px-3 sm:px-4 py-2 sm:py-3 text-sm bg-card border-0',
              'transition-all duration-200 outline-none',
              'placeholder:text-muted-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          <div className="inline-flex items-center px-3 sm:px-4 text-sm text-muted-foreground bg-muted/50 border-l border-border">
            {suffix}
          </div>
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-11 px-4 py-3 text-sm bg-card border border-border rounded-xl',
          'transition-all duration-200 outline-none',
          'focus:ring-2 focus:ring-primary/30 focus:border-transparent',
          'placeholder:text-muted-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)

CustomInput.displayName = 'CustomInput'

export { CustomInput }