import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { Inter } from 'next/font/google'
import { StrictMode } from 'react'
import './globals.css'
import QueryProvider from '@/components/QueryProvider'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const title = config.appName
const description = config.appDescription

export const metadata: Metadata = {
  metadataBase: new URL(config.appUrl),
  title: {
    template: `%s | ${config.appName}`,
    default: config.appName,
  },
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
  keywords:
    'indonesia, wilayah indonesia, administrative areas, peta interaktif, interactive map, nextjs, tailwindcss, typescript, react, leaflet, maplibre',
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
            <QueryProvider>{children}</QueryProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </StrictMode>
  )
}
