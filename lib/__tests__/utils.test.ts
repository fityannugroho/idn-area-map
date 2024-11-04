import { describe, expect, test, vi } from 'vitest'
import { Area } from '../const'
import {
  addDotSeparator,
  cn,
  debounce,
  determineAreaByCode,
  getAllParents,
  getAreaRelations,
  getObjectKeys,
  objectFromEntries,
  objectToEntries,
  ucFirstStr,
  ucWords,
} from '../utils'

describe('objectToEntries', () => {
  test('should convert object to entries', () => {
    const obj = { a: 1, b: 2 }
    const result = objectToEntries(obj)
    expect(result).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })

  test('should return empty array for empty object', () => {
    const obj = {}
    const result = objectToEntries(obj)
    expect(result).toEqual([])
  })
})

describe('getObjectKeys', () => {
  test('should return object keys', () => {
    const obj = { a: 1, b: 2 }
    const result = getObjectKeys(obj)
    expect(result).toEqual(['a', 'b'])
  })

  test('should return empty array for empty object', () => {
    const obj = {}
    const result = getObjectKeys(obj)
    expect(result).toEqual([])
  })
})

describe('objectFromEntries', () => {
  test('should convert entries to object', () => {
    const entries: [string, number][] = [
      ['a', 1],
      ['b', 2],
    ]
    const result = objectFromEntries(entries)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  test('should return empty object for empty entries', () => {
    const entries: [string, number][] = []
    const result = objectFromEntries(entries)
    expect(result).toEqual({})
  })
})

describe('getAreaRelations', () => {
  test('should return parent and child areas', () => {
    const area = Area.PROVINCE
    const result = getAreaRelations(area)
    expect(result).toEqual({ parent: undefined, child: Area.REGENCY })
  })

  test('should return undefined for invalid area', () => {
    const area = 'INVALID' as Area
    const result = getAreaRelations(area)
    expect(result).toEqual({ parent: undefined, child: undefined })
  })
})

describe('addDotSeparator', () => {
  test('should add dot separator to area code', () => {
    expect(addDotSeparator('9603')).toBe('96.03')
    expect(addDotSeparator('960301')).toBe('96.03.01')
    expect(addDotSeparator('9603011001')).toBe('96.03.01.1001')
    expect(addDotSeparator('123')).toBe('123')
  })

  test('should return input for invalid length', () => {
    expect(addDotSeparator('')).toBe('')
    expect(addDotSeparator('1')).toBe('1')
    expect(addDotSeparator('12345')).toBe('12345')
  })
})

describe('cn', () => {
  test('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  test('should handle empty input', () => {
    expect(cn()).toBe('')
  })
})

describe('debounce', () => {
  test('should debounce function calls', () =>
    new Promise<void>((done) => {
      let counter = 0
      const increment = () => {
        ++counter
      }
      const debouncedIncrement = debounce(increment, 100)

      debouncedIncrement()
      debouncedIncrement()
      debouncedIncrement()

      setTimeout(() => {
        expect(counter).toBe(1)
        done()
      }, 200)
    }))

  test('should throw error when delay is negative', () => {
    const fn = () => {}
    expect(() => debounce(fn, -100)).toThrow()
  })

  test('should throw error when delay is not a number', () => {
    const fn = () => {}
    // @ts-expect-error invalid argument is given for testing
    expect(() => debounce(fn, 'invalid')).toThrow()
  })

  test('should throw error when callback is not a function', () => {
    // @ts-expect-error invalid argument is given for testing
    expect(() => debounce('not a function', 100)).toThrow()
  })
})

describe('ucFirstStr', () => {
  test('should capitalize the first letter of a string', () => {
    expect(ucFirstStr('hello')).toBe('Hello')
  })

  test('should handle empty string', () => {
    expect(ucFirstStr('')).toBe('')
  })
})

describe('ucWords', () => {
  test('should capitalize the first letter of each word in a string', () => {
    expect(ucWords('hello world')).toBe('Hello World')
  })

  test('should handle empty string', () => {
    expect(ucWords('')).toBe('')
  })
})

describe('getAllParents', () => {
  test('should return all parent areas', () => {
    const area = Area.DISTRICT
    const result = getAllParents(area)
    expect(result).contain(Area.PROVINCE).contain(Area.REGENCY)
  })

  test('should return empty array for top-level area', () => {
    const area = Area.PROVINCE
    const result = getAllParents(area)
    expect(result).toEqual([])
  })
})

describe('determineAreaByCode', () => {
  test('should determine the area by code', () => {
    expect(determineAreaByCode('12')).toBe(Area.PROVINCE)
    expect(determineAreaByCode('12.34')).toBe(Area.REGENCY)
    expect(determineAreaByCode('12.34.56')).toBe(Area.DISTRICT)
    expect(determineAreaByCode('12.34.56789')).toBe(Area.ISLAND)
    expect(determineAreaByCode('12.34.56.7890')).toBe(Area.VILLAGE)
    expect(() => determineAreaByCode('invalid')).toThrow('Invalid area code')
  })

  test('should throw error for invalid code', () => {
    expect(() => determineAreaByCode('')).toThrow('Invalid area code')
    expect(() => determineAreaByCode('123')).toThrow('Invalid area code')
  })
})
