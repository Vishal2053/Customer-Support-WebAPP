import { Link, useNavigate } from 'react-router-dom'
import { Button, Badge } from './UI'
import { useAuth } from '../hooks'
import { useAuthStore } from '../context/store'

export const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin' || user?.email === 'datascientistvishu@gmail.com'

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            OmniSupport AI
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            RAG v1.1
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition">Home</Link>
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <Link to="/admin" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition">Admin Panel</Link>
              ) : (
                <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition">Dashboard</Link>
              )}
              {isAdmin && (
                <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition">User Console</Link>
              )}
              <span className="text-sm font-medium text-indigo-400 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
                {user?.email}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-500/10 hover:border-red-500/20"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button size="sm">Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export const Sidebar = ({ items, active, onSelect }) => (
  <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 min-h-screen p-6 sticky top-[73px] flex flex-col justify-between">
    <div>
      <div className="mb-8">
        <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Workspace</p>
        <h3 className="font-semibold text-slate-300 text-sm mt-1">Customer Support Center</h3>
      </div>
      <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-3">Navigation</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 flex items-center gap-3 ${
                active === item.id
                  ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
    <div className="pt-6 border-t border-slate-800">
      <p className="text-[10px] text-slate-600 text-center font-mono">OmniSupport AI Dashboard © 2026</p>
    </div>
  </aside>
)

export const Hero = () => (
  <div className="relative overflow-hidden py-24 md:py-32 bg-slate-950">
    {/* Glowing background blobs */}
    <div className="glow-blob glow-indigo top-10 left-1/4"></div>
    <div className="glow-blob glow-cyan bottom-10 right-1/4"></div>
    
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Text Content */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <Badge variant="primary">🧠 Custom Knowledge Retrieval (RAG)</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Automate Support with <br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              RAG-Powered Chatbots
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl">
            Train your AI agent with raw website URLs or documents. We convert and index your data semantically so that Groq LLMs can query and answer visitor questions with absolute context accuracy.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/login">
              <Button size="lg" className="px-8">
                Login to Build Your Chatbot
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Hero Advanced Technical Graph */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            
            <h3 className="font-semibold text-slate-200 mb-5 text-sm uppercase tracking-wider font-mono">
              ⚡ RAG PIPELINE FLOW
            </h3>
            
            <div className="space-y-4">
              {[
                { step: '01', title: 'Data Scraping & Crawling', desc: 'Auto-crawls internal pages and extracts raw text content.' },
                { step: '02', title: 'Vector Embeddings', desc: 'MiniLM model converts chunks to 384-dim (padded to 1536) vectors.' },
                { step: '03', title: 'Supabase Vector Database', desc: 'Stores embeddings in pgvector and indexes with Cosine distance.' },
                { step: '04', title: 'Context Retrieval & LLM', desc: 'Matches query vector, attaches context, and Groq generates the response.' }
              ].map((flow, index) => (
                <div key={index} className="flex gap-4 p-3 rounded-lg bg-slate-900/40 border border-slate-800/40">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs font-mono">
                    {flow.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{flow.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{flow.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
)

export const Features = () => (
  <div className="py-24 bg-slate-950/40 border-t border-slate-900">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-xl mx-auto mb-16">
        <Badge variant="primary">Platform Features</Badge>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3">
          Advanced Customer Support Automation
        </h2>
        <p className="text-slate-400 mt-4">
          Everything you need to scrape your website, vectorize knowledge base data, and deliver fast, intelligent responses to visitors.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: 'Recursive Website Crawler',
            desc: 'Don\'t have content? Provide your site URL and we will scan and crawl internal links to index the entire website as your knowledge base.',
            icon: '🕸️',
          },
          {
            title: 'Embeddable JS Widget',
            desc: 'Generate a script link and paste it into any website. Comes pre-integrated with dynamically resolved CORS and a gorgeous chat UI.',
            icon: '💬',
          },
          {
            title: 'Llama/Mixtral LLM Speeds',
            desc: 'Powered by Groq Cloud APIs for incredibly fast sub-second inference speeds. Deliver responses to customers instantly.',
            icon: '⚡',
          },
        ].map((feature, idx) => (
          <div key={idx} className="glass-card p-8 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <div className="text-4xl mb-6 bg-slate-900 w-14 h-14 rounded-xl border border-slate-800 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

