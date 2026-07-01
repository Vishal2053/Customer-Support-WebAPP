import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Sidebar } from '../components/Layout'
import { KnowledgeBaseForm } from '../components/KnowledgeBaseForm'
import { useAuth } from '../hooks'
import { useAuthStore } from '../context/store'
import { Card, Button, Badge } from '../components/UI'
import { knowledgeBaseAPI, widgetAPI, analyticsAPI, chatAPI } from '../services'

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
        setWidget(response.data.widget)
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
      setWidget(response.data)
    } catch (error) {
      console.error('Failed to generate widget:', error)
    } finally {
      setLoading(false)
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
