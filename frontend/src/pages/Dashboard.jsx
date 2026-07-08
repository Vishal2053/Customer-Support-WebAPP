import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Sidebar } from '../components/Layout'
import { KnowledgeBaseForm } from '../components/KnowledgeBaseForm'
import { useAuth } from '../hooks'
import { useAuthStore } from '../context/store'
import { Card, Button, Badge } from '../components/UI'
import { knowledgeBaseAPI, widgetAPI, analyticsAPI, chatAPI } from '../services'

const LauncherIconSvg = ({ name, className = "w-6 h-6" }) => {
  if (name === 'support_agent') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6-4.7 8.38 8.38 0 0 1-.9-3.8v-.5a8 8 0 0 1 16 0v.5z" />
        <path d="M18 10a6 6 0 0 0-12 0" />
        <path d="M12 18h.01" />
        <path d="M21 11.5a1.5 1.5 0 0 1-3 0v-1a1.5 1.5 0 0 1 3 0v1z" />
        <path d="M6 11.5a1.5 1.5 0 0 1-3 0v-1a1.5 1.5 0 0 1 3 0v1z" />
      </svg>
    )
  }
  if (name === 'chat_dots') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="8" cy="10" r="1" />
        <circle cx="12" cy="10" r="1" />
        <circle cx="16" cy="10" r="1" />
      </svg>
    )
  }
  if (name === 'sparkles') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
        <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="14" y2="13" />
    </svg>
  )
}


export const Dashboard = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const logout = useAuthStore((state) => state.logout)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [stats, setStats] = useState(null)
  const [widget, setWidget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [widgetLoading, setWidgetLoading] = useState(true)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  // Widget Customizer States
  const [widgetTitle, setWidgetTitle] = useState('Chat with us')
  const [widgetDesc, setWidgetDesc] = useState('How can we help?')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')
  const [widgetPosition, setWidgetPosition] = useState('bottom-right')
  const [welcomeTitle, setWelcomeTitle] = useState('hey hii')
  const [welcomeMessage, setWelcomeMessage] = useState('hii how can i help you')
  const [launcherIcon, setLauncherIcon] = useState('chat_bubble')
  const [bubbleEnabled, setBubbleEnabled] = useState(true)
  const [savingWidget, setSavingWidget] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [previewChatOpen, setPreviewChatOpen] = useState(false)
  const [previewBubbleDismissed, setPreviewBubbleDismissed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const loadStats = async () => {
    if (!user?.id) return
    try {
      const response = await analyticsAPI.getStats(user.id)
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // Load existing widget on component mount
  const loadUserWidget = async () => {
    if (!user?.id) return
    setWidgetLoading(true)
    try {
      const response = await widgetAPI.getUserWidget(user.id)
      if (response.data?.widget) {
        const w = response.data.widget
        setWidget(w)
        setWidgetTitle(w.title || 'Chat with us')
        setWidgetDesc(w.description || 'How can we help?')
        setPrimaryColor(w.theme?.primary_color || '#4F46E5')
        setWidgetPosition(w.theme?.position || 'bottom-right')
        setWelcomeTitle(w.theme?.welcome_title || 'hey hii')
        setWelcomeMessage(w.theme?.welcome_message || 'hii how can i help you')
        setLauncherIcon(w.theme?.launcher_icon || 'chat_bubble')
        setBubbleEnabled(w.theme?.bubble_enabled !== false)
      }
    } catch (error) {
      console.error('Failed to load widget:', error)
    } finally {
      setWidgetLoading(false)
    }
  }

  const handleGenerateWidget = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const response = await widgetAPI.generateWidget(user.id)
      const w = response.data
      setWidget(w)
      setWidgetTitle(w.title || 'Chat with us')
      setWidgetDesc(w.description || 'How can we help?')
      setPrimaryColor(w.theme?.primary_color || '#4F46E5')
      setWidgetPosition(w.theme?.position || 'bottom-right')
      setWelcomeTitle(w.theme?.welcome_title || 'hey hii')
      setWelcomeMessage(w.theme?.welcome_message || 'hii how can i help you')
      setLauncherIcon(w.theme?.launcher_icon || 'chat_bubble')
      setBubbleEnabled(w.theme?.bubble_enabled !== false)
    } catch (error) {
      console.error('Failed to generate widget:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWidgetSettings = async (e) => {
    e.preventDefault()
    if (!widget?.widget_id) return
    setSavingWidget(true)
    setSaveSuccess(false)
    try {
      const updatedTheme = {
        primary_color: primaryColor,
        secondary_color: '#FFFFFF',
        position: widgetPosition,
        welcome_title: welcomeTitle,
        welcome_message: welcomeMessage,
        launcher_icon: launcherIcon,
        bubble_enabled: bubbleEnabled
      }
      const response = await widgetAPI.updateWidget(widget.widget_id, {
        title: widgetTitle,
        description: widgetDesc,
        theme: updatedTheme
      })
      
      // Update local widget state with new details
      setWidget(prev => ({
        ...prev,
        title: response.data.title,
        description: response.data.description,
        theme: response.data.theme
      }))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update widget settings:', error)
    } finally {
      setSavingWidget(false)
    }
  }

  useEffect(() => {
    if (user?.id && activeMenu === 'overview') {
      loadStats()
    }
  }, [activeMenu, user])

  // Load widget when accessing widget menu
  useEffect(() => {
    if (user?.id && activeMenu === 'widget' && !widget) {
      loadUserWidget()
    }
  }, [activeMenu, user])

  const menuItems = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'knowledge-base', label: '📚 Knowledge Base' },
    { id: 'widget', label: '🔧 Widget' },
    { id: 'conversations', label: '💬 Conversations' },
    { id: 'leads', label: '👥 Leads' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Conversations State & Handlers
  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [chatMode, setChatMode] = useState('bot')
  const [adminMsg, setAdminMsg] = useState('')
  const [sendingAdminMsg, setSendingAdminMsg] = useState(false)

  const loadConversations = async () => {
    if (!user?.id) return
    setConversationsLoading(true)
    try {
      const response = await chatAPI.getConversations(user.id)
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setConversationsLoading(false)
    }
  }

  const loadConversationMessages = async (convId) => {
    setSelectedConversation(convId)
    setMessagesLoading(true)
    try {
      const response = await chatAPI.getConversation(convId)
      setMessages(response.data.messages || [])
      setChatMode(response.data.chat_mode || 'bot')
    } catch (error) {
      console.error('Failed to load conversation messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Silent polling for new messages & mode changes in selected conversation
  useEffect(() => {
    if (!selectedConversation || activeMenu !== 'conversations') return

    const interval = setInterval(async () => {
      try {
        const response = await chatAPI.getConversation(selectedConversation)
        if (response.data) {
          setMessages(response.data.messages || [])
          setChatMode(response.data.chat_mode || 'bot')
        }
      } catch (error) {
        console.error('Failed to poll conversation:', error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedConversation, activeMenu])

  const handleSendAdminMessage = async (e) => {
    e.preventDefault()
    if (!adminMsg.trim() || !selectedConversation) return
    setSendingAdminMsg(true)
    try {
      await chatAPI.sendAdminMessage(selectedConversation, adminMsg)
      setAdminMsg('')
      // Instantly load updated messages
      const response = await chatAPI.getConversation(selectedConversation)
      if (response.data) {
        setMessages(response.data.messages || [])
        setChatMode('human') // Admin reply triggers auto-switch to human mode
      }
    } catch (error) {
      console.error('Failed to send admin message:', error)
    } finally {
      setSendingAdminMsg(false)
    }
  }

  const handleToggleChatMode = async (newMode) => {
    if (!selectedConversation) return
    try {
      await chatAPI.updateChatMode(selectedConversation, newMode)
      setChatMode(newMode)
    } catch (error) {
      console.error('Failed to update chat mode:', error)
    }
  }

  useEffect(() => {
    if (user?.id && activeMenu === 'conversations') {
      loadConversations()
    }
  }, [activeMenu, user])

  // Leads State & Handlers
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)

  const loadLeads = async () => {
    if (!user?.id) return
    setLeadsLoading(true)
    try {
      const response = await analyticsAPI.getLeads(user.id)
      setLeads(response.data.leads || [])
    } catch (error) {
      console.error('Failed to load leads:', error)
    } finally {
      setLeadsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id && activeMenu === 'leads') {
      loadLeads()
    }
  }, [activeMenu, user])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 relative">
        <Sidebar items={menuItems} active={activeMenu} onSelect={setActiveMenu} />
        
        {/* Glow Effects */}
        <div className="glow-blob glow-indigo top-10 right-10"></div>
        
        <main className="flex-1 p-8 z-10 relative">
          {activeMenu === 'overview' && (
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Dashboard Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border border-slate-800/80 bg-slate-900/20">
                  <p className="text-slate-400 text-sm font-medium mb-1">Total Conversations</p>
                  <p className="text-4xl font-extrabold text-white tracking-tight">{stats?.total_conversations || 0}</p>
                </Card>
                <Card className="border border-slate-800/80 bg-slate-900/20">
                  <p className="text-slate-400 text-sm font-medium mb-1">Total Messages</p>
                  <p className="text-4xl font-extrabold text-white tracking-tight">{stats?.total_messages || 0}</p>
                </Card>
                <Card className="border border-slate-800/80 bg-slate-900/20">
                  <p className="text-slate-400 text-sm font-medium mb-1">Avg Messages/Conv</p>
                  <p className="text-4xl font-extrabold text-white tracking-tight">{(stats?.average_messages_per_conversation || 0).toFixed(1)}</p>
                </Card>
              </div>
            </div>
          )}

          {activeMenu === 'knowledge-base' && (
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Knowledge Base</h2>
              <KnowledgeBaseForm userId={user?.id} />
            </div>
          )}

          {activeMenu === 'widget' && (
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Chatbot Widget</h2>
              <Card className="mb-6 border border-slate-800 bg-slate-900/20">
                <div className="mb-2">
                  {widgetLoading ? (
                    <p className="text-slate-400 text-sm">Loading widget...</p>
                  ) : widget ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-white">Your Embeddable Widget</h3>
                        <Badge variant="success">Ready</Badge>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Copy the script code below and paste it right before the closing <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400 font-mono text-xs">&lt;/body&gt;</code> tag on your website's pages.
                      </p>
                      <div className="bg-slate-950 border border-slate-800 p-4.5 rounded-lg relative group">
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">HTML Script Tag Embed:</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(widget.embed_code);
                              setCopiedEmbed(true);
                              setTimeout(() => setCopiedEmbed(false), 2000);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-all duration-200 cursor-pointer active:scale-95"
                            title="Copy to Clipboard"
                          >
                            <span>{copiedEmbed ? '✅' : '📋'}</span>
                            <span>{copiedEmbed ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="text-xs font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap break-all bg-slate-900/40 p-3 rounded border border-slate-800/40">{widget.embed_code}</pre>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-4.5 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">Direct Widget URL:</p>
                          <a href={widget.widget_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-mono break-all">
                            {widget.widget_url}
                          </a>
                        </div>
                        <a href={widget.widget_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">Open Demo 🔗</Button>
                        </a>
                      </div>

                      {/* Visual Editor Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-800/80 pt-8 mt-8">
                        {/* Customizer Settings Form */}
                        <div className="lg:col-span-5 space-y-6">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-white">🎨 Customize Widget</h3>
                            <p className="text-xs text-slate-400">Design your widget appearance and colors in real-time.</p>
                          </div>
                          
                          <form onSubmit={handleSaveWidgetSettings} className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Widget Title (Header)</label>
                              <input
                                type="text"
                                value={widgetTitle}
                                onChange={(e) => setWidgetTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Chat with us"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Welcome Description</label>
                              <input
                                type="text"
                                value={widgetDesc}
                                onChange={(e) => setWidgetDesc(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="How can we help?"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Accent Color</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  value={primaryColor}
                                  onChange={(e) => setPrimaryColor(e.target.value)}
                                  className="w-10 h-10 border border-slate-800 rounded cursor-pointer bg-transparent"
                                />
                                <input
                                  type="text"
                                  value={primaryColor}
                                  onChange={(e) => setPrimaryColor(e.target.value)}
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                              </div>
                              <div className="flex gap-2 mt-2">
                                {['#4F46E5', '#1f6650', '#0284C7', '#059669', '#DC2626', '#7C3AED'].map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setPrimaryColor(c)}
                                    className={`w-6 h-6 rounded-full border ${primaryColor === c ? 'border-white scale-110' : 'border-slate-800'} transition-all`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-slate-800 pt-4 mt-4">
                              <h4 className="font-semibold text-sm text-slate-300 mb-3">Welcome Prompter Bubble</h4>
                              
                              <div className="mb-3 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="bubbleEnabled"
                                  checked={bubbleEnabled}
                                  onChange={(e) => setBubbleEnabled(e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <label htmlFor="bubbleEnabled" className="text-sm text-slate-300 select-none cursor-pointer">Show prompt bubble next to icon</label>
                              </div>

                              {bubbleEnabled && (
                                <div className="space-y-3 pl-4 border-l border-slate-800">
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bubble Title (Bold)</label>
                                    <input
                                      type="text"
                                      value={welcomeTitle}
                                      onChange={(e) => setWelcomeTitle(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                                      placeholder="hey hii"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bubble Message</label>
                                    <input
                                      type="text"
                                      value={welcomeMessage}
                                      onChange={(e) => setWelcomeMessage(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                                      placeholder="hii how can i help you"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-slate-800 pt-4">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Launcher Button Icon</label>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { id: 'chat_bubble', label: 'Message' },
                                  { id: 'chat_dots', label: 'Dots' },
                                  { id: 'support_agent', label: 'Agent' },
                                  { id: 'sparkles', label: 'AI Spark' }
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setLauncherIcon(item.id)}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                                      launcherIcon === item.id
                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-350 hover:bg-slate-900/60'
                                    }`}
                                  >
                                    <LauncherIconSvg name={item.id} className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-semibold">{item.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Widget Screen Position</label>
                              <select
                                value={widgetPosition}
                                onChange={(e) => setWidgetPosition(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                              >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                              </select>
                            </div>

                            <div className="pt-2">
                              <Button type="submit" disabled={savingWidget} className="w-full flex items-center justify-center gap-2">
                                {savingWidget ? 'Saving...' : 'Save Design Settings'}
                              </Button>
                              {saveSuccess && (
                                <p className="text-emerald-400 text-xs font-semibold text-center mt-2 animate-pulse">
                                  ✓ Design settings saved successfully!
                                </p>
                              )}
                            </div>
                          </form>
                        </div>

                        {/* Live Design Preview */}
                        <div className="lg:col-span-7 flex flex-col space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg text-white">👀 Live Design Preview</h3>
                              <p className="text-xs text-slate-400 font-normal">Click elements inside the browser mock below to test the widget logic.</p>
                            </div>
                            <button
                              onClick={() => {
                                setPreviewChatOpen(false)
                                setPreviewBubbleDismissed(false)
                              }}
                              className="text-xs text-indigo-400 hover:text-indigo-350 font-semibold cursor-pointer"
                            >
                              Reset Preview State
                            </button>
                          </div>
                          
                          <div className="w-full h-[520px] border border-slate-800 rounded-xl relative overflow-hidden bg-slate-950 flex flex-col shadow-inner">
                            {/* Browser Mock Header */}
                            <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-3 flex items-center gap-2 text-slate-400">
                              <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                                <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                              </div>
                              <div className="bg-slate-950/80 border border-slate-800/80 text-[10px] font-mono text-slate-500 px-3 py-1 rounded flex-1 text-center select-none truncate">
                                🌐 https://your-website.com
                              </div>
                            </div>

                            {/* Simulated Website Content */}
                            <div className="flex-1 p-8 flex flex-col justify-center items-center text-center space-y-4 relative select-none bg-slate-950/50">
                              <div className="max-w-md space-y-2">
                                <h1 className="text-2xl font-black text-slate-200">Your Web Page</h1>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                  This is a visual preview simulation of how your custom chat widget integrates on your pages.
                                </p>
                                <div className="flex justify-center gap-2 pt-2">
                                  <div className="h-1.5 w-16 bg-slate-850 rounded-full"></div>
                                  <div className="h-1.5 w-24 bg-slate-850 rounded-full"></div>
                                  <div className="h-1.5 w-12 bg-slate-850 rounded-full"></div>
                                </div>
                              </div>

                              {/* Interactive Launcher Bubble & Chat Window inside Mock Website */}
                              <div className={`absolute bottom-4 ${widgetPosition === 'bottom-left' ? 'left-4' : 'right-4'} flex flex-col items-${widgetPosition === 'bottom-left' ? 'start' : 'end'} z-40`}>
                                
                                {/* Mock Chat Window Panel */}
                                {previewChatOpen && (
                                  <div className="w-[290px] h-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-850 mb-3 animate-fade-in-up">
                                    {/* Mock Header */}
                                    <div className="px-4 py-3.5 text-white font-bold text-sm flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
                                      <span>{widgetTitle || 'Chat with us'}</span>
                                      <button 
                                        onClick={() => setPreviewChatOpen(false)}
                                        className="text-white/80 hover:text-white text-base font-bold outline-none cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    {/* Mock Message Area */}
                                    <div className="flex-1 bg-slate-55 p-3 overflow-y-auto space-y-3 flex flex-col text-xs">
                                      <div className="self-start max-w-[85%] bg-white border border-slate-200 text-slate-800 px-3 py-2 rounded-2xl rounded-tl-none leading-relaxed">
                                        Hi! Before we begin, what is your name?
                                      </div>
                                      <div className="self-end max-w-[85%] text-white px-3 py-2 rounded-2xl rounded-tr-none leading-relaxed shadow-sm" style={{ backgroundColor: primaryColor }}>
                                        John Doe
                                      </div>
                                      <div className="self-start max-w-[85%] bg-white border border-slate-200 text-slate-800 px-3 py-2 rounded-2xl rounded-tl-none leading-relaxed">
                                        Thanks, John! What is your email address?
                                      </div>
                                      <div className="self-end max-w-[85%] text-white px-3 py-2 rounded-2xl rounded-tr-none leading-relaxed shadow-sm" style={{ backgroundColor: primaryColor }}>
                                        john@example.com
                                      </div>
                                      <div className="self-start max-w-[85%] bg-white border border-slate-200 text-slate-800 px-3 py-2 rounded-2xl rounded-tl-none leading-relaxed">
                                        {widgetDesc || 'How can we help?'}
                                      </div>
                                    </div>
                                    {/* Mock Form */}
                                    <div className="p-2 border-t border-slate-100 bg-white flex gap-2">
                                      <input
                                        type="text"
                                        disabled
                                        placeholder="Type your message..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-400 outline-none"
                                      />
                                      <button
                                        type="button"
                                        className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg select-none cursor-not-allowed"
                                        style={{ backgroundColor: primaryColor }}
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Welcome Bubble */}
                                {bubbleEnabled && !previewBubbleDismissed && !previewChatOpen && (
                                  <div
                                    onClick={() => {
                                      setPreviewChatOpen(true)
                                      setPreviewBubbleDismissed(true)
                                    }}
                                    className={`absolute bottom-1 ${
                                      widgetPosition === 'bottom-left' ? 'left-[60px]' : 'right-[60px]'
                                    } w-[210px] bg-white border border-slate-200 border-t-4 rounded-xl shadow-xl p-3 cursor-pointer text-left text-slate-800 hover:-translate-y-0.5 transition-transform duration-200`}
                                    style={{ borderTopColor: primaryColor }}
                                  >
                                    {/* Tail pointer */}
                                    <div
                                      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-slate-200 ${
                                        widgetPosition === 'bottom-left'
                                          ? 'left-[-6px] border-b border-l'
                                          : 'right-[-6px] border-t border-r'
                                      }`}
                                    />
                                    {/* Dismiss button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setPreviewBubbleDismissed(true)
                                      }}
                                      className="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs font-bold font-mono p-1 select-none outline-none cursor-pointer"
                                    >
                                      ×
                                    </button>
                                    <div className="font-bold text-xs text-slate-900 mb-1 pr-4 break-words">
                                      {welcomeTitle || 'hey hii'}
                                    </div>
                                    <div className="text-[11px] text-slate-500 leading-normal break-words">
                                      {welcomeMessage || 'hii how can i help you'}
                                    </div>
                                  </div>
                                )}

                                {/* Circular FAB Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewChatOpen(!previewChatOpen)
                                    if (!previewChatOpen) {
                                      setPreviewBubbleDismissed(true)
                                    }
                                  }}
                                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer outline-none text-white border-0"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {previewChatOpen ? (
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                  ) : (
                                    <LauncherIconSvg name={launcherIcon} className="w-6 h-6" />
                                  )}
                                </button>

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-lg text-white mb-3">Generate Chatbot Widget</h3>
                      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        Generate your zero-dependency custom chatbot integration script. You can embed it on any website page to immediately fetch custom context and serve visitors.
                      </p>
                      <Button onClick={handleGenerateWidget} disabled={loading}>
                        {loading ? 'Generating script...' : 'Generate Script Link'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeMenu === 'conversations' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Conversations</h2>
                <Button variant="secondary" size="sm" onClick={loadConversations} disabled={conversationsLoading}>
                  {conversationsLoading ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>
              
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Conversation List */}
                <Card className="lg:col-span-5 flex flex-col h-[600px] overflow-y-auto p-4 space-y-3 border border-slate-800 bg-slate-900/20">
                  <h3 className="font-semibold text-slate-200 mb-2">Visitor Sessions</h3>
                  {conversationsLoading && <p className="text-slate-400 text-sm">Loading conversations...</p>}
                  {!conversationsLoading && conversations.length === 0 && (
                    <p className="text-slate-500 text-sm">No conversations found.</p>
                  )}
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadConversationMessages(conv.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex flex-col gap-1.5 ${
                        selectedConversation === conv.id
                          ? 'bg-indigo-600/10 border-indigo-500/30'
                          : 'bg-slate-950/60 border-slate-850/60 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200 text-sm">{conv.visitor_name}</span>
                        <Badge variant={conv.status === 'active' ? 'success' : 'primary'}>
                          {conv.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">{conv.visitor_email}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1">
                        ID: {conv.id.substring(0, 13)}...
                      </span>
                    </button>
                  ))}
                </Card>
                
                {/* Message Log */}
                <Card className="lg:col-span-7 flex flex-col h-[600px] justify-between p-4 border border-slate-800 bg-slate-900/20">
                  {selectedConversation ? (
                    <>
                      <div className="border-b border-slate-800/80 pb-3 mb-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-slate-200">Conversation Message Logs</h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">Session UUID: {selectedConversation}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            chatMode === 'human' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            Mode: {chatMode === 'human' ? 'Live Chat (Human)' : 'AI Bot'}
                          </span>
                          {chatMode === 'human' ? (
                            <Button size="sm" variant="outline" onClick={() => handleToggleChatMode('bot')}>
                              🤖 Handover to Bot
                            </Button>
                          ) : (
                            <Button size="sm" variant="primary" onClick={() => handleToggleChatMode('human')}>
                              👤 Take Over (Live)
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                        {messagesLoading ? (
                          <p className="text-slate-400 text-sm">Loading message log...</p>
                        ) : messages.length === 0 ? (
                          <p className="text-slate-500 text-sm">No messages exchanged yet.</p>
                        ) : (
                          messages.map((msg) => {
                            const isVisitor = msg.sender === 'user' || msg.sender === 'visitor';
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[85%] ${
                                  isVisitor ? 'ml-auto items-end' : 'mr-auto items-start'
                                }`}
                              >
                                <span className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                                  {isVisitor ? 'Visitor' : (chatMode === 'human' ? 'Admin' : 'AI Assistant')}
                                </span>
                                <div
                                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    isVisitor
                                      ? 'bg-indigo-600 text-white rounded-tr-none'
                                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                                  }`}
                                >
                                  {msg.message}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      <form onSubmit={handleSendAdminMessage} className="flex gap-2 mt-2 border-t border-slate-800/80 pt-3">
                        <input
                          type="text"
                          value={adminMsg}
                          onChange={(e) => setAdminMsg(e.target.value)}
                          placeholder="Type a message to send... (Automatically switches to Live Chat)"
                          className="flex-1 bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          disabled={sendingAdminMsg}
                        />
                        <Button type="submit" size="sm" disabled={!adminMsg.trim() || sendingAdminMsg}>
                          {sendingAdminMsg ? '...' : 'Send'}
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                      💬 Select a visitor conversation from the panel list to view the RAG Q&A exchange history.
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {activeMenu === 'leads' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Leads Collection</h2>
                <Button variant="secondary" size="sm" onClick={loadLeads} disabled={leadsLoading}>
                  {leadsLoading ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>
              
              <Card className="overflow-hidden border border-slate-800/80 bg-slate-900/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-4 px-6">Visitor Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Session ID</th>
                        <th className="py-4 px-6">Captured On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
                      {leadsLoading && (
                        <tr>
                          <td colSpan="4" className="py-8 px-6 text-center text-slate-400">Loading leads data...</td>
                        </tr>
                      )}
                      {!leadsLoading && leads.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-8 px-6 text-center text-slate-500">
                            No leads captured yet. Lead contacts are collected when visitors provide their name/email to start chat sessions on your widget.
                          </td>
                        </tr>
                      )}
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-4.5 px-6 font-semibold">{lead.visitor_name}</td>
                          <td className="py-4.5 px-6 font-mono text-indigo-300">{lead.visitor_email}</td>
                          <td className="py-4.5 px-6 text-slate-400 font-mono text-xs">{lead.id}</td>
                          <td className="py-4.5 px-6 text-slate-400">
                            {lead.created_at ? new Date(lead.created_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
