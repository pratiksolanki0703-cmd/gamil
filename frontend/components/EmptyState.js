'use client'

export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Main Card with Glass Effect */}
      <div className="glass rounded-3xl p-10 max-w-lg w-full text-center fade-in">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center pulse-glow">
            <span className="text-5xl">📧</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white text-sm">✓</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 gradient-text">
          text2tool.in - Email
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-lg">
          Your self-hosted email management system
        </p>

        {/* Getting Started Card */}
        <div className="glass rounded-2xl p-6 text-left fade-in-delay-1">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">1</span>
            Getting Started
          </h2>
          <ul className="space-y-3">
            {[
              { icon: '✅', text: 'Configure your domain in worker.js' },
              { icon: '✅', text: 'Set up Cloudflare Email Routing' },
              { icon: '✅', text: 'Deploy your Worker to Cloudflare' },
              { icon: '✅', text: 'Deploy frontend to Vercel' },
              { icon: '🚀', text: 'Start receiving emails!' },
            ].map((item, index) => (
              <li 
                key={index} 
                className={`flex items-center gap-3 text-gray-600 fade-in-delay-${index + 1}`}
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 fade-in-delay-2">
          {[
            { icon: '📨', label: 'Receive Emails' },
            { icon: '📤', label: 'Send Emails' },
            { icon: '💬', label: 'Threading' },
            { icon: '🔍', label: 'Search' },
          ].map((feature, index) => (
            <div 
              key={index}
              className="glass rounded-xl p-4 text-center hover-lift cursor-pointer"
            >
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <span className="text-sm text-gray-600">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Footer */}
      <div className="mt-8 text-center fade-in-delay-3">
        <p className="text-gray-500 text-sm">
          Built with ❤️ by{' '}
          <a 
            href="https://text2tool.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Pratik Solanki
          </a>
        </p>
        <p className="text-gray-400 text-xs mt-1">
          text2tool.in • Open Source Email Management
        </p>
      </div>
    </div>
  )
}
