import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'text2tool.in - Email | Self-Hosted Email Management',
  description: 'A free, self-hosted email management system like Zoho Mail. Manage your custom domain emails with a beautiful Gmail-like interface.',
  keywords: ['email', 'self-hosted', 'cloudflare', 'email management', 'zoho alternative'],
  authors: [{ name: 'Pratik Solanki', url: 'https://text2tool.in' }],
  openGraph: {
    title: 'text2tool.in - Email',
    description: 'Self-hosted email management system',
    url: 'https://text2tool.in',
    siteName: 'text2tool.in Email',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
