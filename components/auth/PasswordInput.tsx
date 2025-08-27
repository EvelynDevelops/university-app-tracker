import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { EyeIcon, EyeOffIcon } from '@/public/icons'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  showToggle?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    
    const toggleButton = showToggle ? (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        {showPassword ? (
          <EyeOffIcon className="w-4 h-4" />
        ) : (
          <EyeIcon className="w-4 h-4" />
        )}
      </button>
    ) : null

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        label={label}
        error={error}
        trailing={toggleButton}
        className={className}
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput } 