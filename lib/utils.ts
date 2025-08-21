import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Area, childArea, parentArea } from './const'

export function objectToEntries<T extends object>(
  obj: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

export function getObjectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

export function objectFromEntries<K extends string | number | symbol, V>(
  entries: [K, V][],
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}

export function getAreaRelations(area: Area) {
  return {
    parent: parentArea[area],
    child: childArea[area],
  }
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
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function')
  }

  if (typeof delay !== 'number' || delay < 0) {
    throw new Error('Delay must be a positive number')
  }

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
