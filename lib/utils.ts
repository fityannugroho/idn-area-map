import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Area, parentArea } from './const'

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
export function debounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: T) => {
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
 * Set the first letter of each word in string into upper-case.
 */
export function ucWords(str: string): string {
  const splitStr = str.toLowerCase().split(' ')

  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }

  return splitStr.join(' ')
}

/**
 * Get all parents of an area.
 */
export function getAllParents<A extends Area>(area: A): Area[] {
  const parent = parentArea[area]

  if (!parent) return []

  return [parent, ...getAllParents(parent)]
}

/**
 * Determine the area of the given code.
 * The code can be separated by dot (.) or not.
 *
 * @throws If code is invalid.
 */
export function determineAreaByCode(code: string): Area {
  if (/^\d{2}$/.test(code)) {
    return Area.PROVINCE
  }

  if (/^\d{2}\.?\d{2}$/.test(code)) {
    return Area.REGENCY
  }

  if (/^\d{2}\.?\d{2}\.?\d{2}$/.test(code)) {
    return Area.DISTRICT
  }

  if (/^\d{2}\.?\d{2}\.?\d{5}$/.test(code)) {
    return Area.ISLAND
  }

  if (/^\d{2}\.?\d{2}\.?\d{2}\.?\d{4}$/.test(code)) {
    return Area.VILLAGE
  }

  throw new Error('Invalid area code')
}
