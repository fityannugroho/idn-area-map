import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { mockData } from '@/app/api/__mocks__/const'
import { mockServer } from '@/app/api/__mocks__/server'
import { Area } from '@/lib/const'
import { useArea } from '../useArea'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const wrapper = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useArea', () => {
  beforeAll(() => mockServer.listen())

  afterEach(() => {
    mockServer.resetHandlers()
    queryClient.clear()
  })

  afterAll(() => mockServer.close())

  test('return array of data when second argument is not provided', async () => {
    const { result } = renderHook(() => useArea(Area.PROVINCE), { wrapper })

    await waitFor(() => {
      return expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockData.province)
  })

  test('does not fetch data when second argument is null', () => {
    const { result } = renderHook(() => useArea(Area.PROVINCE, null), {
      wrapper,
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  test('return array of data when second argument is provided as empty object', async () => {
    const { result } = renderHook(() => useArea(Area.PROVINCE, {}), { wrapper })

    await waitFor(() => {
      return expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockData.province)
  })

  test('return array of data when query is given as second argument', async () => {
    const query = { name: 'sumatera' }
    const { result } = renderHook(() => useArea(Area.PROVINCE, query), {
      wrapper,
    })

    await waitFor(() => {
      return expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(
      mockData.province.filter((province) =>
        province.name.toLowerCase().includes(query.name.toLowerCase()),
      ),
    )
  })

  test('return specific data when code is given as second argument', async () => {
    const code = mockData.province[0].code
    const { result } = renderHook(() => useArea(Area.PROVINCE, code), {
      wrapper,
    })

    await waitFor(() => {
      return expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(
      mockData.province.find((province) => province.code === code),
    )
  })

  test.todo('throws an error when code of the area is not found', async () => {
    const { result } = renderHook(() => useArea(Area.PROVINCE, '00'), {
      wrapper,
    })

    await waitFor(() => {
      return expect(result.current.isSuccess).toBe(false)
    })

    expect(result.current.isError).toBe(true)
    expect(result.current.error).toBe(new Error('Not found'))
  })
})
