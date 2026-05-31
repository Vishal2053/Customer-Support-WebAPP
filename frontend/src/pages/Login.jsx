import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Layout'
import { LoginForm } from '../components/AuthForms'
import { useAuth } from '../hooks'

export const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <LoginForm />
      </div>
    </div>
  )
}
