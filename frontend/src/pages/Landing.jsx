import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Zap, Globe, Code, MessageSquare, Database, Cpu,
  ChevronDown, BarChart3, Settings, Send, FileText, UploadCloud, Rocket, Menu,
} from 'lucide-react';

import leftSideImage from '../assets/images/left-side-image.png';
import rightSideImage from '../assets/images/right-side-image.png';
import fullLogo from '../assets/images/supportly-full-logo.png';

const LogoIcon = ({ className = 'h-14 md:h-16 w-auto' }) => (
  <img src={fullLogo} alt="Supportly Logo" className={`${className} object-contain mix-blend-multiply`} />
);

const AtomIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="3" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" />
  </svg>
);

const OpenAI_Logo = () => (
  <span className="flex items-center gap-1.5 font-black text-[#0F172A] text-sm md:text-base">
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#10A37F]" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.28 9.82a5.96 5.96 0 0 0-.51-4.91 6.04 6.04 0 0 0-6.5-2.9A6.07 6.07 0 0 0 4.99 4.07 5.96 5.96 0 0 0 1 7.93a6.07 6.07 0 0 0 .37 6.66 5.96 5.96 0 0 0 .51 4.91 6.04 6.04 0 0 0 6.5 2.9 5.96 5.96 0 0 0 4.28 1.9 6.07 6.07 0 0 0 5.79-4.21 5.96 5.96 0 0 0 3.96-2.9 6.07 6.07 0 0 0-.37-6.66zM13.06 20.5a4.5 4.5 0 0 1-2.88-1.04l.14-.08 4.78-2.77a.78.78 0 0 0 .39-.68v-6.76l2.02 1.17c.02.01.03.03.03.05v5.6a4.5 4.5 0 0 1-4.48 4.51zM3.6 16.5a4.5 4.5 0 0 1-.54-3.03l.14.08 4.79 2.77a.78.78 0 0 0 .78 0l5.85-3.38v2.33c0 .02 0 .04-.02.05L8.74 17.14A4.5 4.5 0 0 1 3.6 16.5zM2.32 8.95a4.5 4.5 0 0 1 2.35-1.98v5.7c0 .28.15.54.39.68l5.83 3.36-2.02 1.17a.07.07 0 0 1-.06 0L3.97 14.07A4.5 4.5 0 0 1 2.32 8.95zm14.9 3.47-5.85-3.39 2.02-1.16a.07.07 0 0 1 .06 0l4.84 2.79a4.5 4.5 0 0 1-.68 8.11v-5.69a.78.78 0 0 0-.39-.66zm2.01-3.02-.13-.09-4.78-2.78a.78.78 0 0 0-.78 0L9.69 9.91V7.58a.07.07 0 0 1 .03-.06l4.84-2.79a4.5 4.5 0 0 1 6.68 4.67zm-6.36 2.06-2.6-1.5-2.6 1.5v3l2.6 1.5 2.6-1.5z" />
    </svg>
    OpenAI
  </span>
);

const Groq_Logo = () => (
  <span className="font-black text-[#0F172A] text-sm md:text-base tracking-wider uppercase font-poppins flex items-center gap-1">
    <Zap className="w-4 h-4 text-[#F05A28] fill-current animate-pulse" />
    groq
  </span>
);

const LangChain_Logo = () => (
  <span className="font-black text-[#0F172A] text-sm md:text-base flex items-center gap-1.5">
    <span className="w-5 h-5 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-xs shadow-sm">🦜</span>
    LangChain
  </span>
);

const React_Logo = () => (
  <span className="font-black text-[#0F172A] text-sm md:text-base flex items-center gap-1.5">
    <AtomIcon className="w-4 h-4 text-[#00D8FF] animate-spin" style={{ animationDuration: '10s' }} />
    React
  </span>
);

const Node_Logo = () => (
  <span className="font-black text-[#0F172A] text-sm md:text-base flex items-center gap-1.5">
    <span className="w-2.5 h-2.5 bg-[#5FA04E] rounded-full shadow-sm"></span>
    node.js
  </span>
);

const MongoDB_Logo = () => (
  <span className="font-black text-[#0F172A] text-sm md:text-base flex items-center gap-1.5">
    <Database className="w-4 h-4 text-[#47A248]" />
    MongoDB
  </span>
);

const WordPress_Logo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#21759B]" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12 6.63 0 12-5.37 12-12C24 5.37 18.63 0 12 0zm0 1.2a10.8 10.8 0 0 1 7.24 2.82l-5.61 15.36L8.85 6.78A10.74 10.74 0 0 1 12 1.2zM1.2 12c0-2.31.73-4.45 1.97-6.22l5.05 13.84c-4.14-1.28-7.02-5.13-7.02-7.62zm10.8 10.8c-1.35 0-2.63-.25-3.82-.71l3.52-10.23 3.6 9.87a10.76 10.76 0 0 1-3.3.07zm8.83-4.58l-3.32-9.67 3.32-9.1A10.74 10.74 0 0 1 22.8 12c0 2.49-2.88 6.34-7.02 7.62z"/>
  </svg>
);

const Shopify_Logo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#96BF48]" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.34 3.76c-.02 0-.3.06-.3.06s-1.84 1.83-2.36 2.34l-.06-1.5c0-.02-.87-.72-1.32-.72-.45 0-1.85.73-1.85.73l-.06 1.48C8.87 5.64 7.03 3.82 7.03 3.82s-.28-.06-.3-.06c-.02 0-.25.26-.25.26L4.05 19.34l11.54 2.5 4.36-2.5L15.6 4.02s-.24-.26-.26-.26zM11.6 4.43c.12 0 .5.38.5.38s-.92 1.04-1.57 1.77V4.43h1.07zm-2.4 2.15V4.74s.4-.3.52-.3h.85v2.14H9.2zm3.3 11.83H6.12l1.64-10.8 4.74 1.08v9.72zm.84 0V9.01l4.74-1.08 1.64 10.8-6.38 2.08z"/>
  </svg>
);

const Nextjs_Logo = () => (
  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white font-black text-[10px] font-mono tracking-tighter shadow-xs">
    N
  </span>
);

const Vue_Logo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.6 2h4.5l5.9 10.2L17.9 2h4.5L12 19.8 1.6 2z" fill="#42B883" />
    <path d="M6.1 2h3.5l2.4 4.2L14.4 2h3.5L12 11.4 6.1 2z" fill="#35495E" />
  </svg>
);

const Angular_Logo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 5.5l1.5 13L12 22l8.5-3.5L22 5.5 12 2zm0 3.8l5.2 11.7h-2.1l-1.1-2.7H10l-1.1 2.7H6.8L12 5.8zm0 3.2l-1.7 4.2h3.4L12 9z" fill="#DD0031" />
  </svg>
);

const Laravel_Logo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 2.5L2 6v12l6.5 3.5 6.5-3.5v-4l5.5-3v-6L15 2.5 8.5 6 15 9.5v5l-6.5 3.5L2 14.5V8.5L8.5 5 15 8.5" fill="none" stroke="#FF2D20" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PHP_Logo = () => (
  <span className="px-1.5 py-0.5 bg-[#777BB4] text-white font-black text-[9px] rounded-md tracking-tight font-mono shadow-xs">
    PHP
  </span>
);

const FastAPI_Logo = () => (
  <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center shadow-xs">
    <Zap className="w-3 h-3 text-white fill-current" />
  </div>
);

const HTML5_Logo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2h18l-1.6 18L12 22l-7.4-2L3 2zm15 4H7l.3 3.5h10.2l-.6 6.5-4.9 1.4-4.9-1.4-.3-3.5h3.2l.2 1.6 1.8.5 1.8-.5.2-2.1H6.7L5.7 6h12.3z" fill="#E34F26" />
  </svg>
);

const Webflow_Logo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#146EF5]" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.8 6.5c-1.8 0-3.3 1-4.1 2.5C13.9 7.5 12.4 6.5 10.6 6.5c-2.4 0-4.4 1.8-4.8 4.2H2.3v3.6h3.6v-3.6c.3-1.4 1.4-2.4 2.8-2.4 1.5 0 2.8 1.2 2.8 2.7v7h3.6v-7c0-1.5 1.2-2.7 2.8-2.7 1.5 0 2.8 1.2 2.8 2.7v7h3.6v-7c0-4.1-3.3-7.5-7.7-7.5z" />
  </svg>
);

const integrationsList = [
  { name: 'WordPress', icon: <WordPress_Logo />, bg: 'bg-[#21759B]/10 border-[#21759B]/20' },
  { name: 'Shopify', icon: <Shopify_Logo />, bg: 'bg-[#96BF48]/10 border-[#96BF48]/20' },
  { name: 'Next.js', icon: <Nextjs_Logo />, bg: 'bg-slate-100 border-slate-300' },
  { name: 'React', icon: <AtomIcon className="w-5 h-5 text-[#00D8FF] animate-spin" style={{ animationDuration: '10s' }} />, bg: 'bg-sky-50 border-sky-200' },
  { name: 'Vue', icon: <Vue_Logo />, bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'Angular', icon: <Angular_Logo />, bg: 'bg-rose-50 border-rose-200' },
  { name: 'Laravel', icon: <Laravel_Logo />, bg: 'bg-red-50 border-red-200' },
  { name: 'PHP', icon: <PHP_Logo />, bg: 'bg-indigo-50 border-indigo-200' },
  { name: 'FastAPI', icon: <FastAPI_Logo />, bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'Node.js', icon: <span className="w-2.5 h-2.5 bg-[#5FA04E] rounded-full shadow-sm"></span>, bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'HTML', icon: <HTML5_Logo />, bg: 'bg-orange-50 border-orange-200' },
  { name: 'Webflow', icon: <Webflow_Logo />, bg: 'bg-blue-50 border-blue-200' },
];

const faqData = [
  { q: 'What is Supportly?', a: 'Supportly is an AI-powered customer support platform that lets businesses build custom Retrieval-Augmented Generation (RAG) chatbots using their own websites and documents. Customers get instant, 24/7 accurate answers.' },
  { q: 'How does the AI chatbot train on website URLs?', a: 'Simply input your website URL, and our crawler recursively scans internal links, extracts high-quality text content, and builds a semantic database of your services and policies in minutes.' },
  { q: 'What file formats are supported for document upload?', a: 'Supportly supports PDF, DOCX, TXT, and Markdown files. Our ingestion engine automatically parses, cleans, and structures the text to make it queryable.' },
  { q: 'What is Retrieval-Augmented Generation (RAG)?', a: 'RAG is a technique where the chatbot first searches your private documents/website (Knowledge Base) for relevant answers to a visitor\'s question, then sends that matching context to the LLM (like Groq\'s Mixtral) to formulate a 100% accurate, non-hallucinated response.' },
  { q: 'Can I customize the chat widget\'s appearance?', a: 'Yes! You can completely customize colors, widget icons, launcher button position, header texts, agent names, welcome messages, and initial quick-suggestion chips to match your brand style.' },
  { q: 'How does human handoff work?', a: 'When a customer asks to speak with a human or if the AI reaches a confidence threshold lower than set, the chat escalates. Your human agents will get a real-time notification in the dashboard to take over the conversation instantly.' },
  { q: 'Is my data secure and encrypted?', a: 'Yes, security is our primary focus. We encrypt all data at rest and in transit. Your corporate documents and scrapings are sandboxed and are never shared or leaked outside your workspace.' },
  { q: 'Which integrations are supported?', a: 'Supportly can be integrated into any HTML site, WordPress, Shopify, Webflow, React, Vue, Next.js, Angular, Laravel, PHP, Node.js, and more via a simple JavaScript embed tag.' },
  { q: 'Does it support multiple languages?', a: 'Yes! Supportly automatically detects the language of your customer\'s query and can respond dynamically in over 50 languages, regardless of what language your training documents are in.' },
  { q: 'How fast are the AI responses?', a: 'Extremely fast. Powered by Groq Cloud APIs for sub-second inference speeds, the responses generate and show up on your website in less than 0.8 seconds.' },
];

export function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FBFF] text-slate-800 flex flex-col justify-between overflow-x-hidden selection:bg-supportly-secondary selection:text-white-pure">
      <div className="bg-[#F8FBFF] min-h-screen relative">
        <div className="glow-blob glow-indigo top-0 left-1/4 animate-pulse-soft"></div>
        <div className="glow-blob glow-cyan top-[600px] right-1/4 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        <div className="glow-blob glow-indigo top-[1600px] left-10 animate-pulse-soft" style={{ animationDelay: '4s' }}></div>
        <div className="glow-blob glow-cyan top-[2800px] right-10 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>

        {/* Navbar */}
        <header className="sticky top-4 z-50 w-full px-4 sm:px-6 max-w-7xl mx-auto">
          <nav className="glass-capsule px-4 sm:px-6 py-3 rounded-[24px] md:rounded-full flex flex-col md:flex-row justify-between items-center transition-all duration-300">
            <div className="w-full md:w-auto flex justify-between items-center">
              <a href="#" className="flex items-center gap-2 group">
                <LogoIcon className="h-12 md:h-16 w-auto drop-shadow-sm" />
              </a>
              <div className="flex items-center gap-2 md:hidden">
                <Link to="/login">
                  <button className="bg-[#1B6FE5] hover:bg-[#124975] text-white-pure px-4 py-2 rounded-full text-xs font-black shadow-md">
                    Login
                  </button>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-[#124975] hover:bg-slate-100/60 rounded-full transition-all focus:outline-none"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base font-black text-[#124975]">
              <a href="#features" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Features</a>
              <a href="#how-it-works" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">How It Works</a>
              <a href="#why-supportly" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Use Cases</a>
              <a href="#faq" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Docs</a>
              <a href="#contact" className="hover:text-[#1B6FE5] transition-colors px-1 py-1">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#1B6FE5] hover:bg-[#124975] text-white-pure px-6 py-2.5 rounded-full text-xs md:text-sm font-black shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  Login
                </button>
              </Link>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full md:hidden pt-4 pb-2 border-t border-slate-200/60 mt-3 flex flex-col gap-3 text-center font-black text-[#124975]"
                >
                  <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1B6FE5] py-1.5 transition-colors">Features</a>
                  <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1B6FE5] py-1.5 transition-colors">How It Works</a>
                  <a href="#why-supportly" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1B6FE5] py-1.5 transition-colors">Use Cases</a>
                  <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1B6FE5] py-1.5 transition-colors">Docs</a>
                  <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1B6FE5] py-1.5 transition-colors">Contact</a>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </header>

        {/* HERO */}
        <section id="hero" className="container mx-auto px-6 pt-6 pb-12 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col items-start text-left px-6 sm:px-10 md:px-12 lg:pl-14 lg:pr-4 xl:pl-16 justify-center my-auto">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#124975] tracking-[-0.03em] leading-[1.3] mb-6 font-poppins"
              >
                Build AI Customer Support
                <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-[#1B6FE5] to-[#4F9DFF] bg-clip-text text-transparent">in Minutes</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[#0F172A] text-lg font-bold leading-relaxed max-w-md mb-8 font-sans"
              >
                Train your chatbot with your website or documents and provide instant AI-powered responses 24/7 using advanced Retrieval-Augmented Generation (RAG) technology.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col gap-3 mb-8 w-full max-w-md"
              >
                {['Website Crawling', 'PDF Knowledge Base', 'Groq Powered AI', '5 Minute Setup'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[#0F172A] font-extrabold font-sans">
                    <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Check className="w-4 h-4 text-[#1B6FE5] stroke-[3.5]" />
                    </div>
                    <span className="text-base tracking-wide">{item}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 w-full"
              >
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-[#1B6FE5] hover:bg-[#124975] text-white-pure px-8 py-3.5 rounded-full font-extrabold text-base shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-[0.98]">
                    Start Free
                  </button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-[#124975] hover:bg-[#1B6FE5] text-white-pure px-8 py-3.5 rounded-full font-extrabold text-base shadow-md transition-all duration-300 active:scale-[0.98]">
                    Live Demo
                  </button>
                </a>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xs text-slate-400 font-semibold mt-4 flex items-center gap-1.5 font-sans"
              >
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full inline-block"></span>
                No credit card required
              </motion.p>
            </div>

            <div className="lg:col-span-7 relative flex justify-center">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-100/50 rounded-full filter blur-3xl pointer-events-none"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-[540px] bg-white border border-[#124975]/[0.08] rounded-[24px] shadow-[0_15px_50px_rgba(18,73,117,0.06)] p-6 relative select-none animate-float-subtle overflow-hidden"
              >
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <LogoIcon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-[10px] font-bold text-slate-400">Overview</span>
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">JD</div>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 border-r border-slate-100/80 pr-3 flex flex-col gap-1.5 font-sans">
                    <div className="px-2 py-1.5 rounded-lg bg-blue-50 text-[#1B6FE5] text-[10px] font-bold flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1B6FE5]"></div>
                      Overview
                    </div>
                    {['Conversations', 'Knowledge Base', 'Analytics', 'Integrations', 'Settings'].map((item, idx) => (
                      <div key={idx} className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 text-[10px] font-semibold flex items-center gap-1.5 cursor-default transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="col-span-9 flex flex-col gap-4 font-sans">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Visitors', val: '234', inc: '▲ 12%' },
                        { label: 'AI Responses', val: '95%', inc: '▲ 8%' },
                        { label: 'Avg Response', val: '0.8 sec', inc: '▲ 15%' },
                        { label: 'Conversations', val: '142', inc: '▲ 20%' },
                      ].map((stat, sIdx) => (
                        <div key={sIdx} className="bg-white border border-[#124975]/[0.06] p-2.5 rounded-xl flex flex-col justify-between shadow-[0_4px_12px_rgba(18,73,117,0.01)]">
                          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-xs font-black text-[#124975]">{stat.val}</span>
                            <span className="text-[8px] font-extrabold text-emerald-500">{stat.inc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-7 bg-white border border-[#124975]/[0.06] p-2.5 rounded-xl flex flex-col gap-2 shadow-[0_4px_12px_rgba(18,73,117,0.01)]">
                        <span className="text-[8px] font-extrabold text-[#124975] uppercase tracking-wider block">Recent</span>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { text: 'How do I reset my password?', time: '2m ago' },
                            { text: 'What are your pricing plans?', time: '5m ago' },
                          ].map((conv, cIdx) => (
                            <div key={cIdx} className="flex gap-1.5 items-center bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
                              <div className="w-4 h-4 bg-blue-50 border border-blue-100 text-[#1B6FE5] rounded-full flex items-center justify-center text-[8px] font-bold">U</div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[8px] font-bold text-slate-700 truncate">{conv.text}</span>
                                <span className="text-[6.5px] text-slate-400 font-semibold">{conv.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-5 bg-white border border-[#124975]/[0.06] p-2.5 rounded-xl flex flex-col justify-between shadow-[0_4px_12px_rgba(18,73,117,0.01)]">
                        <span className="text-[8px] font-extrabold text-[#124975] uppercase tracking-wider block">Activity</span>
                        <div className="relative flex-grow flex items-end justify-between h-14 px-1 pb-1">
                          <svg className="absolute inset-0 w-full h-full p-1" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 80 Q20 50, 40 70 T80 30 T100 20" fill="none" stroke="#1B6FE5" strokeWidth="3.5" strokeLinecap="round" />
                            <path d="M0 80 Q20 50, 40 70 T80 30 T100 20 L100 100 L0 100 Z" fill="url(#gradient-fill-mock)" opacity="0.1" />
                            <defs>
                              <linearGradient id="gradient-fill-mock" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1B6FE5" />
                                <stop offset="100%" stopColor="#1B6FE5" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                          {['M', 'T', 'W', 'T', 'F'].map((day, idx) => (
                            <span key={idx} className="text-[6.5px] text-slate-400 font-bold z-10">{day}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 sm:w-52 w-full max-sm:relative max-sm:right-0 max-sm:bottom-0 max-sm:mt-4 bg-white border border-[#124975]/[0.08] shadow-2xl rounded-2xl p-3 animate-float-reverse font-sans">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <LogoIcon className="h-5 w-5" />
                      <span className="text-[8px] text-emerald-500 font-extrabold flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        Online
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-[8px] leading-relaxed mb-2 max-h-28 overflow-y-auto">
                    <div className="bg-[#1B6FE5] text-white-pure p-2 rounded-xl self-end max-w-[85%] rounded-tr-none shadow-sm font-sans">
                      What are your pricing plans?
                    </div>
                    <div className="bg-slate-50 border border-[#124975]/[0.06] text-slate-600 p-2 rounded-xl self-start max-w-[85%] rounded-tl-none shadow-sm font-sans">
                      We offer three plans: Starter, Pro, and Enterprise. Each plan is designed to fit different needs. Would you like me to share the details?
                    </div>
                    <div className="bg-[#1B6FE5] text-white-pure p-2 rounded-xl self-end max-w-[85%] rounded-tr-none shadow-sm font-sans">
                      Yes, please!
                    </div>
                  </div>
                  <div className="flex items-center border border-slate-200 rounded-xl p-1.5 bg-slate-50">
                    <input disabled type="text" placeholder="Type a message..." className="bg-transparent flex-grow text-[8px] px-1 text-slate-600 focus:outline-none" />
                    <button className="bg-[#1B6FE5] p-1 rounded-lg text-white-pure hover:bg-[#124975] transition-all">
                      <Send className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUSTED TECHNOLOGIES */}
        <section className="py-10 bg-white/60 border-y border-[#124975]/[0.06] relative z-10 backdrop-blur-sm">
          <div className="container mx-auto px-6 max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-8 font-sans">
            <span className="text-xs font-black text-[#124975] uppercase tracking-wider">Trusted by innovative teams using</span>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              <OpenAI_Logo />
              <Groq_Logo />
              <LangChain_Logo />
              <React_Logo />
              <Node_Logo />
              <MongoDB_Logo />
            </div>
          </div>
        </section>

        {/* PROBLEM VS SOLUTION */}
        <section id="why-supportly" className="py-10 container mx-auto px-6 max-w-7xl relative z-10 scroll-mt-24">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div whileHover={{ y: -6 }} className="supportly-card-premium p-8 flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-rose-50/30 via-white to-rose-50/10 flex-1 border border-rose-100/80 shadow-md">
              <div className="flex-1 order-2 md:order-1 text-left">
                <h3 className="text-2xl font-black text-[#991B1B] mb-5 font-poppins">Without Supportly</h3>
                <ul className="space-y-4 font-sans">
                  {['Slow response times', 'Repetitive questions', 'Lost leads and customers', 'High support workload'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[#0F172A] font-extrabold text-base">
                      <div className="w-6 h-6 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <X className="w-4 h-4 text-[#DC2626] stroke-[3.5]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-36 h-36 md:w-44 md:h-44 flex-shrink-0 order-1 md:order-2 flex items-center justify-center p-2 bg-rose-50/80 border border-rose-100 rounded-2xl shadow-sm">
                <img src={leftSideImage} alt="Without Supportly" className="w-full h-full object-contain rounded-xl" />
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} className="supportly-card-premium p-8 flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/10 flex-1 border border-emerald-100/80 shadow-md">
              <div className="flex-1 order-2 md:order-1 text-left">
                <h3 className="text-2xl font-black text-[#065F46] mb-5 font-poppins">With Supportly</h3>
                <ul className="space-y-4 font-sans">
                  {['Instant AI responses', 'Learns from your content', '24/7 customer support', 'More satisfied customers'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[#0F172A] font-extrabold text-base">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Check className="w-4 h-4 text-[#059669] stroke-[3.5]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-36 h-36 md:w-44 md:h-44 flex-shrink-0 order-1 md:order-2 flex items-center justify-center p-2 bg-emerald-50/80 border border-emerald-100 rounded-2xl shadow-sm">
                <img src={rightSideImage} alt="With Supportly" className="w-full h-full object-contain rounded-xl" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* SETUP PROCESS TIMELINE */}
        <section id="how-it-works" className="py-10 container mx-auto px-6 max-w-7xl relative z-10 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-supportly-primary tracking-tight font-poppins">Simple 5-Step Setup</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 relative">
            {[
              { num: '01', title: 'Connect Website', desc: 'Add your website URL', icon: Globe },
              { num: '02', title: 'Build Knowledge Base', desc: 'We crawl and index data', icon: UploadCloud },
              { num: '03', title: 'Customize Widget', desc: 'Set colors and settings', icon: Settings },
              { num: '04', title: 'Embed Script', desc: 'Add to your website', icon: Code },
              { num: '05', title: 'Go Live', desc: 'AI assistant is ready', icon: Rocket },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative flex flex-col items-center h-full">
                  <div className="supportly-card-premium p-6 flex flex-col items-center text-center w-full h-full relative z-10 justify-start">
                    <div className="w-12 h-12 bg-blue-50 border border-blue-100/50 text-[#1B6FE5] rounded-2xl flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(27,111,229,0.06)]">
                      <StepIcon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <h4 className="font-extrabold text-[#124975] text-xs md:text-sm mb-2 font-poppins">{step.title}</h4>
                    <p className="text-slate-500 font-medium text-[10px] md:text-xs leading-relaxed font-sans">{step.desc}</p>
                  </div>
                  {idx < 4 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3.5 transform -translate-y-1/2 translate-x-1/2 z-20 items-center justify-center pointer-events-none">
                      <svg className="w-4 h-4 opacity-50 text-[#1B6FE5]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-10 bg-white/40 border-y border-slate-200/50 backdrop-blur-sm relative z-10 scroll-mt-24">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-supportly-primary tracking-tight font-poppins">Powerful Features</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Website Crawler', desc: 'Automatically crawl your website and build a semantic knowledge base.', icon: Globe },
                { title: 'Document Upload', desc: 'Upload PDFs, DOCX, TXT and Markdown files.', icon: FileText },
                { title: 'AI Chat Widget', desc: 'Beautiful, customizable live widget.', icon: MessageSquare },
                { title: 'Lightning Fast', desc: 'Powered by Groq Cloud for sub-second responses.', icon: Zap },
                { title: 'RAG-Powered AI', desc: 'More accurate answers with real context.', icon: Cpu },
                { title: 'Analytics Dashboard', desc: 'Track conversations and improve performance.', icon: BarChart3 },
              ].map((f, idx) => {
                const IconComponent = f.icon;
                return (
                  <motion.div key={idx} whileHover={{ y: -6 }} className="supportly-card-premium p-6 flex flex-col justify-between h-full bg-white font-sans hover:border-[#1B6FE5]/30">
                    <div>
                      <div className="w-11 h-11 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-center justify-center text-[#1B6FE5] mb-5 shadow-[0_4px_12px_rgba(27,111,229,0.06)]">
                        <IconComponent className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <h3 className="font-extrabold text-[#124975] text-sm md:text-base mb-2 font-poppins">{f.title}</h3>
                      <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ANALYTICS SECTION */}
        <section className="py-10 container mx-auto px-6 max-w-7xl relative z-10 font-sans">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 flex flex-col items-start text-left">
              <h2 className="text-3xl font-extrabold text-[#124975] tracking-tight mb-4 leading-tight font-poppins">Powerful Insights</h2>
              <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">
                Monitor conversations, track performance, and optimize your support experience with real-time analytics.
              </p>
              <button className="bg-[#1B6FE5] hover:bg-[#124975] text-white-pure px-6 py-2.5 rounded-full font-extrabold text-sm shadow-sm transition-all active:scale-[0.98]">
                View Dashboard
              </button>
            </div>
            <div className="lg:col-span-8 supportly-card-premium p-6 md:p-8 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Visitors', count: '1,204', rate: '▲ 18%' },
                  { label: 'Questions Answered', count: '6,845', rate: '▲ 24%' },
                  { label: 'Customer Satisfaction', count: '97%', rate: '▲ 6%' },
                  { label: 'Avg Response Time', count: '0.7 sec', rate: '▼ 30%' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-[#124975]/[0.06] p-4 rounded-2xl flex flex-col justify-between shadow-[0_4px_15px_rgba(18,73,117,0.02)]">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
                      <span className="text-lg font-black text-[#124975] block mt-1.5">{stat.count}</span>
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-emerald-500">{stat.rate}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-[#124975]/[0.06] rounded-2xl p-4 flex flex-col justify-between h-44 shadow-[0_4px_15px_rgba(18,73,117,0.02)] relative">
                <div className="relative flex-grow flex items-end justify-between px-2 pt-6 h-32">
                  <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(18, 73, 117, 0.03)" strokeWidth="1" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(18, 73, 117, 0.03)" strokeWidth="1" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(18, 73, 117, 0.03)" strokeWidth="1" />
                    <path d="M0 80 Q20 50, 40 70 T80 30 T100 20 L100 100 L0 100 Z" fill="url(#gradient-fill-insight)" opacity="0.08" />
                    <path d="M0 80 Q20 50, 40 70 T80 30 T100 20" fill="none" stroke="#1B6FE5" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="0" cy="80" r="3.5" fill="#1B6FE5" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="40" cy="70" r="3.5" fill="#1B6FE5" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="80" cy="30" r="3.5" fill="#1B6FE5" stroke="#FFFFFF" strokeWidth="1.5" />
                    <defs>
                      <linearGradient id="gradient-fill-insight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1B6FE5" />
                        <stop offset="100%" stopColor="#1B6FE5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => (
                    <span key={dIdx} className="text-[10px] text-slate-400 font-extrabold z-10">{day}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DASHBOARD SHOWCASE */}
        <section className="py-10 bg-white/40 border-y border-slate-200/50 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-supportly-primary tracking-tight font-poppins">Dashboard Showcase</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              {[
                { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
                { id: 'sources', label: 'Knowledge Sources', icon: Database },
                { id: 'widget', label: 'Widget Customizer', icon: Settings },
                { id: 'apikeys', label: 'API Credentials', icon: Code },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs md:text-sm border-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#1B6FE5] text-white-pure border-[#1B6FE5] shadow-md shadow-blue-500/20'
                        : 'bg-white border-[#124975]/20 text-[#124975] hover:bg-blue-50/70 hover:border-[#1B6FE5]'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white-pure' : 'text-[#1B6FE5]'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="supportly-card-premium p-6 md:p-8 max-w-4xl mx-auto min-h-[340px] flex flex-col justify-between bg-white font-sans">
              <AnimatePresence mode="wait">
                {activeTab === 'analytics' && (
                  <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex flex-col gap-6">
                    <div>
                      <h4 className="font-extrabold text-[#124975] text-base font-poppins">Analytics Overview</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { title: 'Total Conversations', val: '1,204', rate: '▲ 18%' },
                        { title: 'Answer Accuracy', val: '97.4%', rate: '▲ 0.5%' },
                        { title: 'Escalated to Agent', val: '34', rate: '▼ 12%' },
                        { title: 'Response Latency', val: '0.72s', rate: 'Groq Speed' },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white border border-[#124975]/[0.06] p-4 rounded-2xl shadow-[0_4px_15px_rgba(18,73,117,0.02)]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{item.title}</span>
                          <span className="text-lg font-black text-[#124975] block mt-2">{item.val}</span>
                          <span className="text-[9px] font-bold text-emerald-500 block mt-1">{item.rate}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'sources' && (
                  <motion.div key="sources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex flex-col gap-6">
                    <div>
                      <h4 className="font-extrabold text-[#124975] text-base font-poppins">Knowledge Bases & Ingestion</h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {[
                        { type: 'Website Scraper', label: 'https://docs.supportly.com', status: 'Synced', size: '42 pages crawled', icon: Globe, color: 'text-blue-500' },
                        { type: 'Manual Upload', label: 'product_specifications_v4.pdf', status: 'Indexed', size: '1.2 MB file', icon: FileText, color: 'text-emerald-500' },
                      ].map((item, idx) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={idx} className="bg-white border border-[#124975]/[0.06] p-4 rounded-2xl flex items-center justify-between shadow-[0_4px_15px_rgba(18,73,117,0.02)]">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-9 h-9 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-center ${item.color}`}>
                                <ItemIcon className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{item.type}</span>
                                <span className="text-xs font-black text-[#124975] block mt-0.5">{item.label}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-500 block">{item.size}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1.5">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'widget' && (
                  <motion.div key="widget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4 text-left">
                      <div>
                        <h4 className="font-extrabold text-[#124975] text-base font-poppins">Widget Customizer</h4>
                      </div>
                      <div className="flex flex-col gap-3 text-xs text-slate-600 font-bold">
                        <label className="flex flex-col gap-1.5 text-slate-500">
                          Theme Brand Color
                          <div className="flex gap-2 mt-1">
                            <span className="w-6 h-6 rounded-full bg-[#124975] border border-slate-200 ring-2 ring-[#124975]/20 cursor-pointer"></span>
                            <span className="w-6 h-6 rounded-full bg-[#1B6FE5] border border-slate-200 cursor-pointer"></span>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 flex items-center justify-center border border-[#124975]/[0.06] shadow-[0_4px_15px_rgba(18,73,117,0.02)]">
                      <div className="w-full max-w-[220px] bg-white border border-[#124975]/[0.08] rounded-2xl p-3 shadow-md">
                        <div className="bg-[#1B6FE5] p-2.5 rounded-xl flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-extrabold text-white-pure">Supportly Assistant</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-[9px] text-slate-600 leading-relaxed mb-8 text-left">
                          Ask me anything...
                        </div>
                        <div className="border border-slate-200 p-1.5 rounded-xl flex justify-between items-center text-[8px] text-slate-400">
                          Type a message...
                          <Send className="w-2.5 h-2.5 text-supportly-secondary" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'apikeys' && (
                  <motion.div key="apikeys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex flex-col gap-6 text-left">
                    <div>
                      <h4 className="font-extrabold text-[#124975] text-base font-poppins">API Keys & Embed Script</h4>
                    </div>
                    <div className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-500">Embed HTML script tag</span>
                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex justify-between items-center text-slate-500 font-mono text-[10px] overflow-x-auto">
                          <code>&lt;script src="https://cdn.supportly.com/widget.js" data-id="sp_9874a2ff" async&gt;&lt;/script&gt;</code>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="py-10 container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-supportly-primary tracking-tight font-poppins">Integrations</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {integrationsList.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                className="supportly-card-premium p-4 flex flex-col items-center justify-center text-center bg-white font-sans border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1B6FE5]/40 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center mb-2.5 shadow-xs ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="font-extrabold text-[#0F172A] text-xs font-poppins">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </section>



        {/* TESTIMONIALS */}
        <section className="py-12 bg-white/60 border-y border-slate-200/60 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#124975] tracking-tight font-poppins">Trusted Results</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah Jenkins', role: 'Head of Support at FlowSaaS', stars: 5, text: 'Supportly reduced our incoming customer emails by over 60% in the first two weeks. We crawled our documentation, and the widget formulated responses immediately.', avatar: 'SJ' },
                { name: 'Alex Rivera', role: 'Co-Founder of QuickCart', stars: 5, text: 'The integration speed was unbelievable. Literally copied one line of Javascript onto our Shopify store, and we had an intelligent support assistant responding to customers.', avatar: 'AR' },
                { name: 'David Chen', role: 'Director of Operations, EduLearn', stars: 5, text: 'Our product guidelines are massive PDFs. Supportly handles document upload and parsing seamlessly, allowing users to query our handbooks effortlessly.', avatar: 'DC' },
              ].map((t, idx) => (
                <div key={idx} className="supportly-card-premium bg-white border border-slate-200 rounded-2xl p-7 shadow-md flex flex-col justify-between hover:border-[#1B6FE5]/40 transition-all duration-200">
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, sIdx) => (
                        <span key={sIdx} className="text-amber-400 text-base">★</span>
                      ))}
                    </div>
                    <p className="text-[#0F172A] font-semibold text-sm md:text-base leading-relaxed mb-6 font-sans">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#124975] text-white-pure flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="font-black text-[#0F172A] text-sm font-poppins">{t.name}</h4>
                      <span className="text-xs text-[#1B6FE5] font-extrabold block mt-0.5">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-10 container mx-auto px-6 max-w-4xl relative z-10 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-supportly-primary tracking-tight font-poppins">FAQ</h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqData.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-xs md:text-sm text-supportly-primary hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === idx ? 'transform rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-6 pb-5 pt-1 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-8 container mx-auto px-6 max-w-7xl relative z-10">
          <div className="bg-supportly-gradient rounded-[24px] p-10 md:p-14 text-center shadow-xl relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl"></div>
            <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white-pure tracking-tight mb-4 font-poppins">
                Ready to Automate Your Customer Support?
              </h2>
              <p className="text-indigo-100 text-sm md:text-base font-medium mb-8 leading-relaxed">
                Build your AI assistant in minutes and delight your users 24/7
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="#features">
                  <button className="bg-[#124975] hover:bg-[#1B6FE5] text-white-pure border border-white/30 px-8 py-3.5 rounded-full font-black text-sm md:text-base shadow-md transition-all duration-200 active:scale-[0.98]">
                    View Demo
                  </button>
                </a>
              </div>
            </div>
            <div className="absolute right-10 bottom-6 opacity-[0.06] text-white-pure select-none pointer-events-none hidden lg:block">
              <svg viewBox="0 0 100 100" className="w-24 h-24 fill-current">
                <rect x="10" y="10" width="80" height="70" rx="30" />
                <polygon points="30,75 20,95 45,80" />
              </svg>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact" className="mt-8 border-t border-slate-200/20 pt-16 relative z-10 bg-[#0B1B2C] text-slate-400 font-sans">
          <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            <div className="md:col-span-4 flex flex-col items-start gap-4">
              <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-white/20 shadow-md">
                <img src={fullLogo} alt="Supportly Logo" className="h-14 md:h-16 w-auto object-contain mix-blend-multiply" />
              </div>
              <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xs text-left">
                RAG-powered AI assistants that understand your content and help your customers instantly.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white-pure transition-all text-xs font-extrabold">Twitter</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white-pure transition-all text-xs font-extrabold">LinkedIn</a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white-pure transition-all text-xs font-extrabold">GitHub</a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 md:col-span-5 text-left">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Product</span>
                <a href="#features" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Features</a>
                <a href="#pricing" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Pricing</a>
                <a href="#why-supportly" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Use Cases</a>
                <a href="#features" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Integrations</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resources</span>
                <a href="#" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Documentation</a>
                <a href="#" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Blog</a>
                <a href="#" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Help Center</a>
                <a href="#" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">API Reference</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Company</span>
                <a href="#" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">About Us</a>
                <a href="#contact" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Contact</a>
                <a href="#" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Privacy Policy</a>
                <a href="#" className="text-xs text-slate-500 hover:text-white-pure font-bold transition-all">Terms of Service</a>
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col items-start gap-3 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Stay Updated</span>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">Get product updates and tips.</p>
              <div className="flex items-center gap-1.5 w-full bg-white border border-slate-200 rounded-full p-1 mt-1">
                <input type="email" placeholder="Enter your email" className="bg-transparent text-[#0F172A] text-xs px-3 py-1.5 flex-grow focus:outline-none placeholder-slate-400 font-medium" />
                <button className="bg-[#1B6FE5] hover:bg-[#124975] text-white-pure p-2 rounded-full transition-all flex items-center justify-center">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#081422] py-6">
            <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-extrabold">
              <span>© {new Date().getFullYear()} Supportly. All rights reserved.</span>
              <div className="flex gap-4">
                <a href="#" className="text-slate-500 hover:text-white-pure transition-all">Privacy Policy</a>
                <a href="#" className="text-slate-500 hover:text-white-pure transition-all">Terms of Service</a>
                <a href="#" className="text-slate-500 hover:text-white-pure transition-all">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
