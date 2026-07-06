import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Layout'
import { LoginForm } from '../components/AuthForms'
import { useAuth } from '../hooks'
import logoImg from '../assets/images/supportly-app-logo.png'

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
      <div className="flex flex-col items-center justify-center py-20 px-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center max-w-[200px] border border-slate-200 hover:scale-[1.02] transition-transform duration-200">
            <img src={logoImg} alt="Supportly Logo" className="h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-4 bg-gradient-to-r from-indigo-200 via-slate-200 to-cyan-200 bg-clip-text text-transparent">Supportly</h1>
          <p className="text-slate-400 text-xs mt-1.5 font-mono">Add. Monitor. Chat. Support.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
