import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Areas, parentArea } from './const'
import { z } from 'zod'

/**
 * Add dot separator for the area code.
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
 * Get all parents of an area.
 */
export function getAllParents<Area extends Areas>(area: Area): Areas[] {
  const parent = parentArea[area]

  if (!parent) return []

  return [parent, ...getAllParents(parent)]
}

/**
 * Schema for area code, either province, regency, district, or village.
 * The code can be separated by dot (.) or not.
 */
export const areaCodeSchema = z.string().refine(
  (code) => {
    return /^\d{2}(?:\.?\d{2})?(?:\.?\d{2})?(?:\.?\d{4})?$/.test(code)
  },
  {
    message: 'Invalid area code',
  },
)

/**
 * Determine the area of the given code.
 * The code can be separated by dot (.) or not.
 *
 * @throws If code is invalid.
 */
export function determineAreaByCode(code: string): Areas {
  if (/^\d{2}$/.test(code)) {
    return 'provinces'
  }

  if (/^\d{2}\.?\d{2}$/.test(code)) {
    return 'regencies'
  }

  if (/^\d{2}\.?\d{2}\.?\d{2}$/.test(code)) {
    return 'districts'
  }

  if (/^\d{2}\.?\d{2}\.?\d{5}$/.test(code)) {
    return 'islands'
  }

  if (/^\d{2}\.?\d{2}\.?\d{2}\.?\d{4}$/.test(code)) {
    return 'villages'
  }

  throw new Error('Invalid area code')
}
