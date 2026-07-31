'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import ConversationView from '../components/ConversationView'
import EmptyState from '../components/EmptyState'
import { getConversations, getConversation, markAsRead, getConfig } from '../lib/api'

export default function Home() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('all')
  const [emailAddresses, setEmailAddresses] = useState([])

  // Fetch config and conversations on mount
  useEffect(() => {
    fetchConfig()
    fetchConversations()
  }, [])

  const fetchConfig = async () => {
    try {
      const config = await getConfig()
      setEmailAddresses(config.emails || [])
    } catch (err) {
      console.error('Failed to fetch config:', err)
      // Fallback to empty array
      setEmailAddresses([])
    }
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getConversations()
      setConversations(data.conversations || [])
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = async (conversationId) => {
    try {
      setError(null)
      const data = await getConversation(conversationId)
      setSelectedConversation(data.conversation)
      setMessages(data.messages || [])

      await markAsRead(conversationId)

      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      )
    } catch (err) {
      console.error('Failed to fetch conversation:', err)
      setError(err.message)
    }
  }

  // Filter conversations by selected email and search query
  const filteredConversations = useMemo(() => {
    let filtered = conversations

    // Filter by selected email (which inbox received the email)
    if (selectedEmail !== 'all') {
      filtered = filtered.filter(conv =>
        conv.received_by_email?.toLowerCase() === selectedEmail.toLowerCase()
      )
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
        conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [conversations, selectedEmail, searchQuery])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        conversations={filteredConversations}
        selectedId={selectedConversation?.id}
        onSelect={handleSelectConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
        selectedEmail={selectedEmail}
        onEmailSelect={setSelectedEmail}
        emailAddresses={emailAddresses}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            messages={messages}
            onRefresh={fetchConversations}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}
