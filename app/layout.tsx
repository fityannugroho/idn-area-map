import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { Inter } from 'next/font/google'
import { StrictMode } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const title = config.appName
const description = config.appDescription

export const metadata: Metadata = {
  title,
  description,
  robots: {
    index: true,
    follow: true,
  },
  generator: 'Next.js',
  applicationName: config.appName,
  openGraph: {
    siteName: config.appName,
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    site: config.appName,
    title,
    description,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StrictMode>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            inter.variable,
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </StrictMode>
  )
}
