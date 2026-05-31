import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services'
import { useAuthStore } from '../context/store'
import { Card, Input, Button } from './UI'

export const LoginForm = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login({ email, password })
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setSession({
        user: response.data.user,
        token: response.data.access_token,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p className="text-center mt-4 text-sm text-gray-600">
        Don't have an account? <a href="/signup" className="text-primary-500 hover:underline">Sign up</a>
      </p>
    </Card>
  )
}

export const SignupForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
    first_name: '',
    last_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authAPI.signup(formData)
      navigate('/login', { state: { message: 'Signup successful! Please login.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
        />
        <Input
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        <Input
          name="company_name"
          label="Company Name"
          value={formData.company_name}
          onChange={handleChange}
          placeholder="Your Company"
          required
        />
        <Input
          name="first_name"
          label="First Name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="John"
        />
        <Input
          name="last_name"
          label="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Doe"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      <p className="text-center mt-4 text-sm text-gray-600">
        Already have an account? <a href="/login" className="text-primary-500 hover:underline">Login</a>
      </p>
    </Card>
  )
}
