import type { Areas } from './const'

export type Config = Readonly<{
  appName: string
  appDescription: string
  appUrl: string
  dataSource: {
    area: {
      url: string
      pagination: {
        defaultPageSize: number
        maxPageSize: number
      }
    }
    boundary: {
      url: string
    }
  }
}>

export const config: Config = {
  appName: 'idn-area Map',
  appDescription: 'Map of Indonesia Area',
  appUrl:
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'https://idn-area-map.vercel.app',
  dataSource: {
    area: {
      url: process.env.DATA_SOURCE_URL ?? 'https://idn-area.up.railway.app',
      pagination: {
        defaultPageSize: Number.parseInt(
          process.env.DATA_SOURCE_PAGINATION_DEFAULT_PAGE_SIZE ?? '10',
        ),
        maxPageSize: Number.parseInt(
          process.env.DATA_SOURCE_PAGINATION_MAX_PAGE_SIZE ?? '100',
        ),
      },
    },
    boundary: {
      url:
        process.env.DATA_SOURCE_BOUNDARY_URL ??
        'https://raw.githubusercontent.com/fityannugroho/idn-area-boundary/main/data',
    },
  },
} as const

export type FeatureAreas = Exclude<Areas, 'islands'>

export type FeatureConfig = Readonly<
  Record<
    FeatureAreas,
    {
      color: string
      fillColor: string
      order: number
      simplification: {
        tolerance: number
      }
    }
  >
>

export const featureConfig: FeatureConfig = {
  provinces: {
    color: '#2563eb',
    fillColor: '#2563eb33',
    order: 0,
    simplification: {
      tolerance: 0.012,
    },
  },
  regencies: {
    color: '#16a34a',
    fillColor: '#16a34a33',
    order: 1,
    simplification: {
      tolerance: 0.005,
    },
  },
  districts: {
    color: '#facc15',
    fillColor: '#facc1533',
    order: 2,
    simplification: {
      tolerance: 0.001,
    },
  },
  villages: {
    color: '#ef4444',
    fillColor: '#ef444433',
    order: 3,
    simplification: {
      tolerance: 0.0001,
    },
  },
} as const
