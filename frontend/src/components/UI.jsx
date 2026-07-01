export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
    outline: 'border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const Card = ({ children, className = '' }) => (
  <div className={`glass-card rounded-xl p-6 ${className}`}>
    {children}
  </div>
)

export const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
    <input
      className={`w-full px-4 py-2.5 rounded-lg focus:outline-none glass-input focus:ring-2 focus:ring-indigo-500/30 ${
        error ? 'border-red-500/50' : ''
      }`}
      {...props}
    />
    {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
  </div>
)

export const Select = ({ label, options, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
    <select
      className={`w-full px-4 py-2.5 rounded-lg focus:outline-none glass-input focus:ring-2 focus:ring-indigo-500/30 ${
        error ? 'border-red-500/50' : ''
      }`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
  </div>
)

export const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${variants[variant]}`}>
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
    <div className={`${sizes[size]} border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin`} />
  )
}

