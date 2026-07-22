import { Link, useNavigate } from 'react-router-dom'
import { Button, Badge } from './UI'
import { useAuth } from '../hooks'
import { useAuthStore } from '../context/store'
import fullLogo from '../assets/images/supportly-full-logo.png'

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
    <nav className="glass-capsule sticky top-4 mx-auto z-50 w-[95%] max-w-7xl px-6 py-3 rounded-full flex justify-between items-center transition-all duration-300">
      <Link to="/" className="flex items-center gap-2 group">
        <img src={fullLogo} alt="Supportly Logo" className="h-14 md:h-16 w-auto object-contain mix-blend-multiply drop-shadow-sm" />
      </Link>

      <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
        <a href="/#features" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Features</a>
        <a href="/#how-it-works" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">How It Works</a>
        <a href="/#why-supportly" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Use Cases</a>
        <a href="/#faq" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Docs</a>
        <Link to="/contact" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Contact</Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {isAdmin ? (
              <Link to="/admin">
                <button className="text-xs font-extrabold text-[#1B6FE5] hover:text-[#124975] px-3 py-1.5 transition-all">
                  Admin Panel
                </button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <button className="text-xs font-extrabold text-[#1B6FE5] hover:text-[#124975] px-3 py-1.5 transition-all">
                  Dashboard
                </button>
              </Link>
            )}
            <span className="hidden lg:inline text-xs font-semibold text-[#124975] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-600 hover:bg-red-500/20 px-4 py-2 rounded-full text-xs font-bold border border-red-500/20 transition-all active:scale-[0.98]"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="bg-[#1B6FE5] hover:bg-[#124975] text-white-pure px-6 py-2.5 rounded-full text-xs md:text-sm font-black shadow-md transition-all duration-200 active:scale-[0.98]">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  )
}

export const Sidebar = ({ items, active, onSelect }) => (
  <aside className="w-64 bg-white/70 border-r border-slate-200/80 min-h-screen p-6 sticky top-[73px] flex flex-col justify-between backdrop-blur-md">
    <div>
      <div className="mb-8 flex items-center gap-3">
        <img src={fullLogo} alt="Supportly Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
      </div>
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3">Navigation</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 flex items-center gap-3 ${
                active === item.id
                  ? 'bg-supportly-secondary text-white-pure shadow-sm shadow-supportly-secondary/10'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
    <div className="pt-6 border-t border-slate-100">
      <p className="text-[10px] text-slate-400 text-center font-mono">Supportly © 2026</p>
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

