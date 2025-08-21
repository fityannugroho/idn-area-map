import { TriangleAlertIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Not Found',
  description:
    "Sorry, we couldn't find the page or resource you were looking for. It might have been removed, renamed, or did not exist in the first place.",
}

export default function NotFound() {
  return (
    <>
      <header>
        <Navbar />
      </header>

      <main className="flex flex-col items-center justify-center text-center h-[calc(100vh-72px)] px-4 py-16 space-y-4">
        <TriangleAlertIcon className="h-10 w-10 text-yellow-500" />
        <h1 className="text-2xl font-bold">404 - Not Found</h1>
        <p className="max-w-prose">
          Sorry, we couldn&apos;t find the page or resource you were looking
          for. It might have been removed, renamed, or did not exist in the
          first place.
        </p>
        <Button asChild>
          <Link href="/">Go to Main Page</Link>
        </Button>
      </main>
    </>
  )
}
