'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <>
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex gap-2 items-center">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Error!
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {'name' in error ? (
                error.message
              ) : (
                <>
                  This can be caused by <b>connection issues</b> or the{' '}
                  <b>area code</b> provided is invalid or does not exist.
                  <br />
                  Try again or search the data manually at the Main Page.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Link href="/">Go to Main Page</Link>
            </AlertDialogCancel>
            <AlertDialogAction onClick={reset}>Try Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
