import { QueryClient } from '@tanstack/react-query'
import { describe, expect, test } from 'vitest'
import { getQueryClient } from '../queryClient'

describe('getQueryClient', () => {
  test('should return an instance of QueryClient', () => {
    const queryClient = getQueryClient()
    expect(queryClient).toBeInstanceOf(QueryClient)
  })

  test('should have defaultOptions with staleTime set to 5 minutes', () => {
    const queryClient = getQueryClient()
    const staleTime = queryClient.getDefaultOptions().queries?.staleTime
    expect(staleTime).toBe(1000 * 60 * 5)
  })
})
