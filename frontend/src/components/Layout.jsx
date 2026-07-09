import { Link, useNavigate } from 'react-router-dom'
import { Button, Badge } from './UI'
import { useAuth } from '../hooks'
import { useAuthStore } from '../context/store'
import logoIcon from '../assets/images/supportly-app-icon.png'

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
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logoIcon} alt="Supportly Logo" className="h-8 w-8 object-contain rounded-lg shadow-md border border-slate-800 bg-white/5 p-0.5 group-hover:scale-105 transition-transform duration-200" />
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Supportly
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            RAG v1.1
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition">Home</Link>
          <a href="/#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition">How it Works</a>
          <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition">Contact</Link>
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
      <div className="mb-8 flex items-center gap-3">
        <img src={logoIcon} alt="Supportly" className="h-8 w-8 rounded-lg object-contain bg-white/5 border border-slate-800 p-0.5" />
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Workspace</p>
          <h3 className="font-semibold text-slate-300 text-sm mt-0.5">Supportly Dashboard</h3>
        </div>
      </div>
      <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-3">Navigation</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.id)}
              className={`sidebar-btn w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 flex items-center gap-3 ${
                active === item.id
                  ? 'active bg-indigo-600/90 text-white shadow-md shadow-indigo-600/10'
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
      <p className="text-[10px] text-slate-600 text-center font-mono">Supportly Dashboard © 2026</p>
    </div>
  </aside>
)

export const Hero = () => (
  <div className="relative overflow-hidden py-24 md:py-32 bg-slate-950">
    {/* Glowing background blobs */}
    <div className="glow-blob glow-indigo top-10 left-1/4"></div>
    <div className="glow-blob glow-cyan bottom-10 right-1/4"></div>
    
    <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
      <Badge variant="primary">🧠 Custom Knowledge Retrieval (RAG)</Badge>
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mt-6">
        Automate Support with <br/>
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          RAG-Powered Chatbots
        </span>
      </h1>
      <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
        Train your AI agent with raw website URLs or documents. We convert and index your data semantically so that Groq LLMs can query and answer visitor questions with absolute context accuracy.
      </p>
      <div className="flex justify-center gap-4 pt-8">
        <Link to="/login">
          <Button size="lg" className="px-8 shadow-lg shadow-indigo-600/10">
            Login to Build Your Chatbot
          </Button>
        </Link>
      </div>
    </div>
  </div>
)

export const HowItWorks = () => (
  <div id="how-it-works" className="py-24 bg-slate-950 border-t border-slate-900 scroll-mt-20">
    <div className="container mx-auto px-6 text-center">
      <Badge variant="primary">Simple 3-Step Setup</Badge>
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 mb-16">
        How It Works
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            step: '01',
            title: 'Connect Knowledge Base',
            desc: 'Add your website URL or upload documents (PDF, DOCX, TXT) to train your custom RAG chatbot with accurate product context.',
            icon: '📂',
          },
          {
            step: '02',
            title: 'Generate Chat Widget',
            desc: 'Configure titles, settings, and themes to instantly generate your customized live chat widget tailored to your brand.',
            icon: '⚙️',
          },
          {
            step: '03',
            title: 'Embed & Automate',
            desc: 'Copy a small, single-line script tag into your HTML. Instantly see the intelligent customer chatbot active on your live site.',
            icon: '⚡',
          },
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-8 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden group hover:-translate-y-1 transition-all duration-200">
            <div className="absolute top-4 right-4 text-slate-700/25 font-bold text-5xl font-mono select-none">
              {item.step}
            </div>
            <div>
              <div className="text-4xl mb-6 bg-slate-900/50 w-14 h-14 rounded-xl border border-slate-800 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-bold text-xl text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
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

