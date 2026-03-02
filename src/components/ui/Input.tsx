import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-md border px-3 py-2 text-sm text-gray-900
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
