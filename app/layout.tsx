import { config } from '@/utils/config'
import { Inter } from 'next/font/google'
import { StrictMode } from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: config.appName,
  description: config.appDescription,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StrictMode>
      <html lang='en'>
        <body className={inter.className}>{children}</body>
      </html>
    </StrictMode>
  )
}
