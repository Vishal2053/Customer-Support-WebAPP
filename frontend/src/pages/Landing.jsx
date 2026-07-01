import { Navbar, Hero, Features } from '../components/Layout'
import { Button, Card } from '../components/UI'
import { useAuth } from '../hooks'
import { Link } from 'react-router-dom'

export const Landing = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <Hero />
        <Features />
        
        {/* Bottom Call-To-Action Section */}
        <div className="py-24 bg-slate-950/20 border-t border-slate-900 relative">
          <div className="glow-blob glow-indigo top-0 left-1/3"></div>
          <div className="container mx-auto px-6 text-center relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Ready to automate your support?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Create your account in seconds, sync your documents or website links, and embed a high-performance customer support bot in minutes.
            </p>
            {isAuthenticated ? (
              <Link to={user?.role === 'admin' || user?.email === 'datascientistvishu@gmail.com' ? "/admin" : "/dashboard"}>
                <Button size="lg" className="px-8 shadow-lg shadow-indigo-600/10">
                  {user?.role === 'admin' || user?.email === 'datascientistvishu@gmail.com' ? "Go to Admin Panel" : "Go to Console Dashboard"}
                </Button>
              </Link>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="px-8 shadow-lg shadow-indigo-600/10">
                    Login to Console Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center">
        <p className="text-sm text-slate-500 font-mono">OmniSupport AI — Build custom RAG assistants instantly</p>
      </footer>
    </div>
  )
}

