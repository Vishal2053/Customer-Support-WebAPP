export const Button = ({ children, variant = 'primary', size = 'md', ...props }) => {
  const baseStyles = 'font-semibold rounded-lg transition-colors'
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
)

export const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <input
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

export const Select = ({ label, options, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <select
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

export const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

export const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin`} />
  )
}
