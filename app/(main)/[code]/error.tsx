'use client'

import MapDashboard from '@/components/map-dashboard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { useEffect } from 'react'

export default function Error({
  error,
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
      <MapDashboard />
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex gap-2 items-center">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Error!
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>{error.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
