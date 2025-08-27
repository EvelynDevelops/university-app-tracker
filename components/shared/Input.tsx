import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  trailing?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, trailing, ...props }, ref) => {
    const id = React.useId()
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {trailing}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 