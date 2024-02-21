import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debounce a function call by a given delay.
 */
export function debounce<T extends any[]>(
  callback: (...args: T) => void,
  delay: number,
) {
  let timeoutId: NodeJS.Timeout | null = null

  return function (...args: T) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Set the first letter of string into upper-case.
 */
export function ucFirstStr(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Add dot separator to the code.
 * - 4 digits (e.g. 9603) becomes 5 digits (e.g. 96.03)
 * - 6 digits (e.g. 960301) becomes 8 digits (e.g. 96.03.01)
 * - 10 digits (e.g. 9603011001) becomes 12 digits (e.g. 96.03.01.1001)
 */
export function addDotSeparator(code: string) {
  const codeLength = code.length

  if (codeLength === 4) return `${code.slice(0, 2)}.${code.slice(2)}`
  if (codeLength === 6)
    return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4)}`
  if (codeLength === 10)
    return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4, 6)}.${code.slice(6)}`

  return code
}
