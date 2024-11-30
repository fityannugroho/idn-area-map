'use client'

import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { HandHeartIcon, Menu } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import GitHubIcon from './icons/GitHubIcon'
import { ThemeToggle } from './theme-toggle'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

export type NavbarProps = {
  className?: string
}

const menuItems = [
  { href: 'https://idn-area.up.railway.app', label: 'API', target: '_blank' },
  { href: '/pilkada2024', label: 'Pilkada 2024', badge: 'New' },
  {
    href: 'https://trakteer.id/fityannugroho/tip',
    label: 'Support',
    icon: HandHeartIcon,
    target: '_blank',
  },
]

export function Navbar({ className }: NavbarProps) {
  const { appName } = config
  const [isOpen, setIsOpen] = React.useState(false)

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
        <ul className="hidden md:flex gap-4 lg:gap-6 text-sm *:text-foreground/60 hover:*:text-foreground">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                target={item.target}
                className="flex items-center gap-1"
              >
                {item.label}
                {item.badge && <Badge variant="outline">{item.badge}</Badge>}
                {item.icon && <item.icon className="h-5 w-5" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Icon group */}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              target="_blank"
              href="https://github.com/fityannugroho/idn-area-map"
            >
              <GitHubIcon className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>

          <ThemeToggle />
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>idn-area Map</SheetTitle>
            </SheetHeader>
            <ul className="flex flex-col gap-4 mt-8">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    target={item.target}
                    className="flex items-center gap-2 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                    {item.badge && (
                      <Badge variant="outline">{item.badge}</Badge>
                    )}
                    {item.icon && <item.icon className="h-5 w-5" />}
                  </Link>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
