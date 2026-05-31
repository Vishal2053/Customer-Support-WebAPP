import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Sidebar } from '../components/Layout'
import { KnowledgeBaseForm } from '../components/KnowledgeBaseForm'
import { useAuth } from '../hooks'
import { useAuthStore } from '../context/store'
import { Card, Button, Badge } from '../components/UI'
import { knowledgeBaseAPI, widgetAPI, analyticsAPI } from '../services'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const logout = useAuthStore((state) => state.logout)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [stats, setStats] = useState(null)
  const [widget, setWidget] = useState(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar items={menuItems} active={activeMenu} onSelect={setActiveMenu} />
        <main className="flex-1 p-8">
          {activeMenu === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <p className="text-gray-600">Total Conversations</p>
                  <p className="text-4xl font-bold">{stats?.total_conversations || 0}</p>
                </Card>
                <Card>
                  <p className="text-gray-600">Total Messages</p>
                  <p className="text-4xl font-bold">{stats?.total_messages || 0}</p>
                </Card>
                <Card>
                  <p className="text-gray-600">Avg Messages/Conv</p>
                  <p className="text-4xl font-bold">{(stats?.average_messages_per_conversation || 0).toFixed(1)}</p>
                </Card>
              </div>
            </div>
          )}

          {activeMenu === 'knowledge-base' && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Knowledge Base</h2>
              <KnowledgeBaseForm userId={user?.id} />
            </div>
          )}

          {activeMenu === 'widget' && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Chatbot Widget</h2>
              <Card className="mb-6">
                <div className="mb-6">
                  {widget ? (
                    <>
                      <h3 className="font-bold mb-4">Widget Generated!</h3>
                      <div className="bg-gray-100 p-4 rounded mb-4">
                        <p className="text-sm font-mono text-gray-700 break-all">{widget.embed_code}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Widget URL: <a href={widget.widget_url} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">{widget.widget_url}</a>
                      </p>
                    </>
                  ) : (
                    <Button onClick={handleGenerateWidget} disabled={loading}>
                      {loading ? 'Generating...' : 'Generate Widget'}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeMenu === 'conversations' && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Conversations</h2>
              <Card>
                <p className="text-gray-600">View and manage customer conversations here</p>
              </Card>
            </div>
          )}

          {activeMenu === 'leads' && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Leads</h2>
              <Card>
                <p className="text-gray-600">View all collected leads and visitor information</p>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
