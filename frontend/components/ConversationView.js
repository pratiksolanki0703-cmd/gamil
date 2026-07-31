'use client'

import { useState } from 'react'
import ReplyBox from './ReplyBox'

export default function ConversationView({ conversation, messages, onRefresh }) {
  const [showReply, setShowReply] = useState(false)
  const [replyTo, setReplyTo] = useState(null)

  const handleReply = (message) => {
    setReplyTo(message)
    setShowReply(true)
  }

  const handleSendReply = async () => {
    setShowReply(false)
    setReplyTo(null)
    onRefresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass border-b border-white/20 p-5">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-xl font-bold gradient-text">{conversation.subject}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {conversation.participants?.join(' • ')}
            </p>
          </div>
          <button
            onClick={() => setShowReply(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500">No messages in this conversation</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`glass rounded-2xl p-5 fade-in-delay-${Math.min(index + 1, 3)} ${
                msg.is_outgoing
                  ? 'ml-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                  : 'mr-12'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                    msg.is_outgoing 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    {msg.from_email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{msg.from_email}</p>
                    <p className="text-xs text-gray-500">To: {msg.to_email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 bg-white/50 px-3 py-1 rounded-full">
                  {new Date(msg.received_at).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 text-gray-700 whitespace-pre-wrap leading-relaxed pl-13">
                {msg.body}
              </div>
              {!msg.is_outgoing && (
                <button
                  onClick={() => handleReply(msg)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Box */}
      {showReply && (
        <ReplyBox
          conversation={conversation}
          replyTo={replyTo}
          onClose={() => {
            setShowReply(false)
            setReplyTo(null)
          }}
          onSend={handleSendReply}
        />
      )}
    </div>
  )
}
