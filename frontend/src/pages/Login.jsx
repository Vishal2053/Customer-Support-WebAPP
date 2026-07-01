import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Layout'
import { LoginForm } from '../components/AuthForms'
import { useAuth } from '../hooks'

export const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.email === 'datascientistvishu@gmail.com') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }, [isAuthenticated, user, navigate])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <Navbar />
      <div className="glow-blob glow-indigo top-20 left-1/3"></div>
      <div className="flex items-center justify-center py-24 px-4 relative z-10">
        <LoginForm />
      </div>
    </div>
  )
}
