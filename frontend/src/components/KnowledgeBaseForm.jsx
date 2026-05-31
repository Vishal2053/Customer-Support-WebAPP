import { useEffect, useState } from 'react'
import { knowledgeBaseAPI } from '../services'
import { useKnowledgeBaseStore } from '../context/store'
import { Card, Input, Button, Badge } from './UI'

export const KnowledgeBaseForm = ({ userId }) => {
  const addItem = useKnowledgeBaseStore((state) => state.addItem)
  const items = useKnowledgeBaseStore((state) => state.items)
  const setItems = useKnowledgeBaseStore((state) => state.setItems)
  const [activeTab, setActiveTab] = useState('website')
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Website form
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteName, setWebsiteName] = useState('')

  // Document form
  const [file, setFile] = useState(null)

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
      })
      addItem(response.data)
      setWebsiteUrl('')
      setWebsiteName('')
      setSuccess('Website scraped and added successfully')
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

  return (
    <div className="space-y-6">
    <Card>
      <h3 className="text-xl font-bold mb-4">Add Knowledge Base</h3>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('website')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'website'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-600'
          }`}
        >
          Website URL
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'document'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-600'
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
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Website'}
          </Button>
        </form>
      )}

      {activeTab === 'document' && (
        <form onSubmit={handleUploadDocument}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              accept=".pdf,.docx,.txt,.doc"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
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
        <p className="text-sm text-gray-600">No knowledge base content yet.</p>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={item.type === 'website' ? 'primary' : 'success'}>
                    {item.type}
                  </Badge>
                  <h4 className="font-semibold text-gray-900">{item.title || item.source}</h4>
                </div>
                <p className="text-sm text-gray-600 break-all">{item.source}</p>
              </div>
              {item.created_at && (
                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              )}
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded p-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {item.content_preview || item.content || 'No extracted content available.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
    </div>
  )
}
