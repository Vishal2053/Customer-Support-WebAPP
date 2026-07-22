module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        supportly: {
          primary: '#124975',
          secondary: '#1B6FE5',
          accent: '#4F9DFF',
          bgLight: '#F8FBFF',
          white: '#FFFFFF',
        },
        // Re-mapping slate to support light theme naturally without modifying component code
        slate: {
          50: '#0f172a',   // text-slate-50 maps to dark charcoal
          100: '#1e293b',  // text-slate-100 maps to dark charcoal
          200: '#334155',  // text-slate-200 maps to dark slate
          300: '#475569',  // text-slate-300 maps to medium dark slate
          400: '#64748b',  // text-slate-400 maps to gray
          500: '#94a3b8',  // text-slate-500 maps to light-medium gray
          600: '#cbd5e1',  // text/border slate-600 maps to light gray
          700: '#e2e8f0',  // border-slate-700 maps to light gray border
          800: '#f1f5f9',  // border-slate-800 maps to light gray border
          900: '#ffffff',  // bg-slate-900 maps to white card
          950: '#f8fafc',  // bg-slate-950 maps to light blue-gray background
        },
        // Re-mapping indigo and accent colors to professional blues
        indigo: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#1e40af',  // text-indigo-300 maps to deep blue
          400: '#2563eb',  // text-indigo-400 maps to royal blue
          500: '#3b82f6',  // primary blue
          600: '#2563eb',  // primary button blue
          700: '#1d4ed8',  // primary hover blue
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        purple: {
          400: '#3b82f6',  // maps purple in gradients to primary blue
        },
        cyan: {
          400: '#60a5fa',  // maps cyan in gradients to light blue
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
