import { useEffect, useState } from 'react'
import { knowledgeBaseAPI } from '../services'
import { useKnowledgeBaseStore } from '../context/store'
import { Card, Input, Button, Badge } from './UI'

export const KnowledgeBaseForm = ({ userId }) => {
  const addItem = useKnowledgeBaseStore((state) => state.addItem)
  const items = useKnowledgeBaseStore((state) => state.items)
  const setItems = useKnowledgeBaseStore((state) => state.setItems)
  const removeItem = useKnowledgeBaseStore((state) => state.removeItem)
  const [activeTab, setActiveTab] = useState('website')
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Website form
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteName, setWebsiteName] = useState('')
  const [crawlWebsite, setCrawlWebsite] = useState(false)

  // Document form
  const [file, setFile] = useState(null)
  
  // View full content modal state
  const [viewedItem, setViewedItem] = useState(null)

  const loadKnowledgeBase = async () => {
    if (!userId) return
    setListLoading(true)
    try {
      const response = await knowledgeBaseAPI.getKnowledgeBase(userId)
      setItems(response.data.items || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load knowledge base')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    loadKnowledgeBase()
  }, [userId])

  // Automatically default to crawling if the knowledge base is empty
  useEffect(() => {
    if (items.length === 0) {
      setCrawlWebsite(true)
    } else {
      setCrawlWebsite(false)
    }
  }, [items])

  const handleAddWebsite = async (e) => {
    e.preventDefault()
    if (!websiteUrl) {
      setError('Please enter a website URL')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await knowledgeBaseAPI.addWebsite(userId, {
        url: websiteUrl,
        name: websiteName || websiteUrl,
        crawl: crawlWebsite,
      })
      addItem(response.data)
      setWebsiteUrl('')
      setWebsiteName('')
      setSuccess(crawlWebsite ? 'Website crawled and added successfully' : 'Website scraped and added successfully')
      await loadKnowledgeBase()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add website')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDocument = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await knowledgeBaseAPI.uploadDocument(userId, file)
      addItem(response.data)
      setFile(null)
      setSuccess('Document uploaded and extracted successfully')
      await loadKnowledgeBase()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base item?')) return
    setError('')
    setSuccess('')
    try {
      await knowledgeBaseAPI.deleteItem(userId, itemId)
      removeItem(itemId)
      setSuccess('Item deleted successfully')
      await loadKnowledgeBase()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete item')
    }
  }

  const handleEditWebsite = (item) => {
    setActiveTab('website')
    setWebsiteUrl(item.source)
    setWebsiteName(item.title || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
    <Card>
      <h3 className="text-xl font-bold mb-4">Add Knowledge Base</h3>

      <div className="flex gap-2 mb-6 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('website')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'website'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Website URL
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'document'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upload Document
        </button>
      </div>

      {activeTab === 'website' && (
        <form onSubmit={handleAddWebsite}>
          <Input
            type="url"
            label="Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
          <Input
            label="Name (optional)"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            placeholder="My Website"
          />
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              id="crawlWebsite"
              checked={crawlWebsite}
              onChange={(e) => setCrawlWebsite(e.target.checked)}
              className="h-4 w-4 text-indigo-500 border-slate-700 bg-slate-900 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="crawlWebsite" className="text-sm text-slate-300 select-none cursor-pointer">
              Crawl entire website (Scrape all internal links)
            </label>
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          {success && <p className="text-emerald-400 text-sm mb-4">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Website'}
          </Button>
        </form>
      )}

      {activeTab === 'document' && (
        <form onSubmit={handleUploadDocument}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Document (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none glass-input focus:ring-2 focus:ring-indigo-500/30 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-300 hover:file:bg-indigo-500/20"
              accept=".pdf,.docx,.txt,.doc"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          {success && <p className="text-emerald-400 text-sm mb-4">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      )}
    </Card>
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Knowledge Base Content</h3>
        <Button type="button" variant="secondary" size="sm" onClick={loadKnowledgeBase} disabled={listLoading}>
          {listLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {items.length === 0 && !listLoading && (
        <p className="text-sm text-slate-400">No knowledge base content yet.</p>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-slate-800/80 bg-slate-900/10 rounded-lg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={item.type === 'website' ? 'primary' : 'success'}>
                    {item.type}
                  </Badge>
                  <h4 className="font-semibold text-slate-100">{item.title || item.source}</h4>
                </div>
                <p className="text-xs text-slate-400 break-all mt-1">{item.source}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.type === 'website' && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleEditWebsite(item)}
                  >
                    ✏️ Edit & Rescrap
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setViewedItem(item)}
                >
                  👁️ View Content
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteItem(item.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  🗑️ Delete
                </Button>
                {item.created_at && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-900/60 rounded-lg p-3">
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {item.content_preview || item.content || 'No extracted content available.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* View Content Modal */}
    {viewedItem && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Badge variant={viewedItem.type === 'website' ? 'primary' : 'success'}>
                {viewedItem.type}
              </Badge>
              <h3 className="text-lg font-bold line-clamp-1">{viewedItem.title || viewedItem.source}</h3>
            </div>
            <button 
              onClick={() => setViewedItem(null)}
              className="text-slate-400 hover:text-slate-200 text-2xl font-semibold leading-none focus:outline-none"
            >
              &times;
            </button>
          </div>
          
          {/* Sub-header (Source URL / path) */}
          <div className="px-6 py-2.5 bg-slate-950/20 border-b border-slate-900">
            <p className="text-xs text-slate-400 break-all">Source: <span className="text-indigo-400 font-mono">{viewedItem.source}</span></p>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 text-slate-300 font-sans text-sm whitespace-pre-wrap leading-relaxed">
            {viewedItem.content || viewedItem.content_preview || 'No content available for this item.'}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/40">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(viewedItem.content || viewedItem.content_preview || '');
                alert('Content copied to clipboard!');
              }}
            >
              📋 Copy Content
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setViewedItem(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
