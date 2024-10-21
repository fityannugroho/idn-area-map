'use client'

import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { GitHubLogoIcon, HeartFilledIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import * as React from 'react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'

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
      <div className="flex items-center gap-6 lg:gap-8">
        <Link href="/" className="text-lg font-semibold">
          {appName}
        </Link>
        <ul className="flex gap-4 lg:gap-6 text-sm *:text-foreground/60 hover:*:text-foreground">
          <li>
            <Link target="_blank" href="https://idn-area.up.railway.app/docs">
              API
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              href="https://trakteer.id/fityannugroho/tip"
              className="flex items-center gap-1"
            >
              Donate
              <HeartFilledIcon className="h-[1rem] w-[1rem] mt-[0.125rem]" />
            </Link>
          </li>
        </ul>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Icon group */}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              target="_blank"
              href="https://github.com/fityannugroho/idn-area-map"
            >
              <GitHubLogoIcon className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
