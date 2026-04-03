import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './components/theme-provider'

export const metadata: Metadata = {
  title: 'Zorvyn — Finance Dashboard',
  description: 'AI-style rule-based financial insights and tracking',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className='app'>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
