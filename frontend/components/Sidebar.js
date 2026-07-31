'use client'

export default function Sidebar({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  loading,
  selectedEmail,
  onEmailSelect,
  emailAddresses
}) {
  return (
    <div className="w-80 glass border-r border-white/20 flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-xl">📧</span>
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Email</h1>
            <p className="text-xs text-gray-500">text2tool.in</p>
          </div>
        </div>
        
        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-10 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Email Filter Tabs */}
      <div className="border-b border-white/20 px-2 py-2">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => onEmailSelect('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedEmail === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            📥 All Mail
          </button>
          {emailAddresses.filter(e => e && !e.includes('noreply')).slice(0, 4).map((email) => (
            <button
              key={email}
              onClick={() => onEmailSelect(email)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                selectedEmail === email
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {email.split('@')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          // Loading Skeletons
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="skeleton skeleton-avatar"></div>
                  <div className="flex-1">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text w-full"></div>
                    <div className="skeleton skeleton-text w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Send an email to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, index) => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`glass rounded-xl p-4 cursor-pointer hover-lift transition-all fade-in-delay-${Math.min(index + 1, 3)} ${
                  selectedId === conv.id 
                    ? 'ring-2 ring-blue-500/50 bg-blue-500/10' 
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold text-sm truncate ${
                    conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {conv.subject}
                  </h3>
                  {conv.unread_count > 0 && (
                    <span className="badge badge-primary ml-2">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mb-2">
                  {conv.last_message_preview}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 truncate max-w-[60%]">
                    {conv.last_sender}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 text-center">
        <p className="text-xs text-gray-400">
          Built by <a href="https://text2tool.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">Pratik Solanki</a>
        </p>
      </div>
    </div>
  )
}
