'use client'

import { cn } from '@/lib/utils'
import { config } from '@/utils/config'
import Link from 'next/link'
import * as React from 'react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { GitHubLogoIcon } from '@radix-ui/react-icons'

export type NavbarProps = {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const { appName } = config

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-6 lg:px-8 border-b-2',
        className,
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <span className="text-lg font-semibold">{appName}</span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Icon group */}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/fityannugroho/idn-area-map">
              <GitHubLogoIcon className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
