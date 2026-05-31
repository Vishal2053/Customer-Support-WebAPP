import { useEffect, useRef } from 'react'
import { Card, Badge, Spinner } from './UI'

export const ChatWidget = ({ conversationId, visitorName, visitorEmail, messages = [], onSendMessage, loading = false }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card className="flex flex-col h-96">
      <div className="border-b pb-4 mb-4">
        <h3 className="font-bold text-lg">{visitorName}</h3>
        <p className="text-sm text-gray-600">{visitorEmail}</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender === 'visitor'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start mb-3">
            <Spinner size="sm" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </Card>
  )
}

export const ConversationList = ({ conversations, onSelectConversation, selectedId }) => (
  <Card className="h-96 overflow-y-auto">
    <h3 className="font-bold text-lg mb-4">Conversations</h3>
    {conversations.length === 0 ? (
      <p className="text-gray-500">No conversations yet</p>
    ) : (
      conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelectConversation(conv.id)}
          className={`p-3 mb-2 rounded cursor-pointer transition ${
            selectedId === conv.id
              ? 'bg-primary-100 border-l-4 border-primary-500'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <p className="font-medium">{conv.visitor_name}</p>
          <p className="text-sm text-gray-600">{conv.visitor_email}</p>
          <Badge variant={conv.status === 'active' ? 'success' : 'warning'} className="text-xs mt-2">
            {conv.status}
          </Badge>
        </div>
      ))
    )}
  </Card>
)
