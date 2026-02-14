import { Area } from './const'

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
  mapbox: {
    accessToken: string | undefined
  }
  umami: {
    websiteId: string | undefined
    scriptUrl: string
  }
}>

export const config: Config = {
  appName: 'idn-area Map',
  appDescription: 'Map of Indonesia Area',
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.NEXT_PUBLIC_CF_PAGES_URL ??
    'http://localhost:3000',
  dataSource: {
    area: {
      url:
        process.env.NEXT_PUBLIC_DATA_SOURCE_URL ??
        'https://idn-area.up.railway.app',
      pagination: {
        defaultPageSize: Number.parseInt(
          process.env.NEXT_PUBLIC_DATA_SOURCE_PAGINATION_DEFAULT_PAGE_SIZE ??
            '10',
          10,
        ),
        maxPageSize: Number.parseInt(
          process.env.NEXT_PUBLIC_DATA_SOURCE_PAGINATION_MAX_PAGE_SIZE ?? '100',
          10,
        ),
      },
    },
    boundary: {
      url:
        process.env.NEXT_PUBLIC_DATA_SOURCE_BOUNDARY_URL ??
        'https://raw.githubusercontent.com/fityannugroho/idn-area-boundary/main/data',
    },
  },
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
  },
  umami: {
    websiteId: process.env.UMAMI_WEBSITE_ID,
    scriptUrl:
      process.env.UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js',
  },
} as const

export type FeatureArea = Exclude<Area, 'island'>

export type FeatureConfig = Readonly<
  Record<
    FeatureArea,
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
  [Area.PROVINCE]: {
    color: '#2563eb',
    fillColor: '#2563eb33',
    order: 0,
    simplification: {
      tolerance: 0.012,
    },
  },
  [Area.REGENCY]: {
    color: '#16a34a',
    fillColor: '#16a34a33',
    order: 1,
    simplification: {
      tolerance: 0.005,
    },
  },
  [Area.DISTRICT]: {
    color: '#facc15',
    fillColor: '#facc1533',
    order: 2,
    simplification: {
      tolerance: 0.001,
    },
  },
  [Area.VILLAGE]: {
    color: '#ef4444',
    fillColor: '#ef444433',
    order: 3,
    simplification: {
      tolerance: 0.0001,
    },
  },
} as const
