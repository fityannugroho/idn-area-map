import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockData } from '@/app/api/__mocks__/const'
import { Area, type Island, type Province, type Regency } from '@/lib/const'
import type { DashboardContext } from '../useDashboard'

// Mock modules first
vi.mock('@/lib/data', () => ({ getData: vi.fn() }))
vi.mock('../useDashboard', () => ({ useMapDashboard: vi.fn() }))

// Import after mocking
import { getData } from '@/lib/data'
import { useMapDashboard } from '../useDashboard'
import { useIslands } from '../useIslands'

const mockGetData = vi.mocked(getData)
const mockUseMapDashboard = vi.mocked(useMapDashboard)

// Helper to create minimal DashboardContext
const createMockDashboardContext = (
  selectedArea: Partial<DashboardContext['selectedArea']> = {},
): DashboardContext => ({
  selectedArea,
  changeSelectedArea: vi.fn(),
  isLoading: {},
  loading: vi.fn(),
  boundaryVisibility: {},
  showBoundary: vi.fn(),
  areaBounds: undefined,
  setAreaBounds: vi.fn(),
  clear: vi.fn(),
})

// Test data with complete types
const mockProvince: Province = { code: '11', name: 'Aceh' }
const mockRegency: Regency = {
  code: '11.01',
  name: 'Kabupaten Aceh Selatan',
  provinceCode: '11',
}

const mockRegencyIslands: Island[] = (mockData[Area.ISLAND] as Island[]).filter(
  (i) => i.regencyCode === '11.01',
)

const mockProvinceIslands: Island[] = [
  {
    code: '11.00.40099',
    coordinate: '00°00\'00.00" N 000°00\'00.00" E',
    isOutermostSmall: false,
    isPopulated: false,
    name: 'Pulau Tanpa Kabupaten',
    regencyCode: null,
    latitude: 0,
    longitude: 0,
  },
]

const createSuccessResponse = (data: Island[]) => ({
  statusCode: 200,
  message: 'OK',
  data,
  meta: {
    total: data.length,
    pagination: {
      total: data.length,
      pages: { first: 1, last: 1, current: 1, previous: null, next: null },
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useIslands', () => {
  beforeEach(() => {
    queryClient.clear()
    mockGetData.mockClear()
    mockUseMapDashboard.mockClear()
  })

  test('returns empty array when no area selected', async () => {
    mockUseMapDashboard.mockReturnValue(createMockDashboardContext({}))

    const { result } = renderHook(() => useIslands(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([])
    expect(mockGetData).not.toHaveBeenCalled()
  })

  test('loads islands for specific regency', async () => {
    mockUseMapDashboard.mockReturnValue(
      createMockDashboardContext({ regency: mockRegency }),
    )
    mockGetData.mockResolvedValue(createSuccessResponse(mockRegencyIslands))

    const { result } = renderHook(() => useIslands(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual(mockRegencyIslands)
    expect(mockGetData).toHaveBeenCalledWith(Area.ISLAND, {
      page: 1,
      parentCode: '11.01',
      limit: expect.any(Number),
    })
  })

  test('loads province islands when province selected without regency', async () => {
    mockUseMapDashboard.mockReturnValue(
      createMockDashboardContext({ province: mockProvince }),
    )
    mockGetData.mockResolvedValue(createSuccessResponse(mockProvinceIslands))

    const { result } = renderHook(() => useIslands(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Should filter province islands by code prefix
    expect(result.current.data).toEqual(mockProvinceIslands)
    expect(mockGetData).toHaveBeenCalledWith(Area.ISLAND, {
      page: 1,
      parentCode: '',
      limit: expect.any(Number),
    })
  })

  test('merges province and regency islands correctly', async () => {
    mockUseMapDashboard.mockReturnValue(
      createMockDashboardContext({
        province: mockProvince,
        regency: mockRegency,
      }),
    )

    // Mock both queries
    mockGetData
      .mockResolvedValueOnce(createSuccessResponse(mockProvinceIslands)) // without-regency query
      .mockResolvedValueOnce(createSuccessResponse(mockRegencyIslands)) // regency query

    const { result } = renderHook(() => useIslands(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Should merge and deduplicate
    const expectedLength =
      mockProvinceIslands.length + mockRegencyIslands.length
    expect(result.current.data).toHaveLength(expectedLength)
  })

  test('handles getData error gracefully', async () => {
    mockUseMapDashboard.mockReturnValue(
      createMockDashboardContext({ regency: mockRegency }),
    )
    mockGetData.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useIslands(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toEqual([])
  })

  test('refetch calls both queries', async () => {
    mockUseMapDashboard.mockReturnValue(
      createMockDashboardContext({
        province: mockProvince,
        regency: mockRegency,
      }),
    )
    mockGetData.mockResolvedValue(createSuccessResponse([]))

    const { result } = renderHook(() => useIslands(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockGetData.mockClear()
    result.current.refetch()

    // Should trigger refetch for both queries
    await waitFor(() => expect(mockGetData).toHaveBeenCalled())
  })
})
