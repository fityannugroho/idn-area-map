export type Config = Readonly<{
  appName: string
  appDescription: string
  appUrl: string
  dataSource: {
    url: string
    pagination: {
      defaultPageSize: number
      maxPageSize: number
    }
  }
}>

export const config: Config = {
  appName: 'idn-area Map',
  appDescription: 'Map of Indonesia Area',
  appUrl:
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'https://idn-area-map.vercel.app',
  dataSource: {
    url: process.env.DATA_SOURCE_URL ?? 'https://idn-area.up.railway.app',
    pagination: {
      defaultPageSize: parseInt(
        process.env.DATA_SOURCE_PAGINATION_DEFAULT_PAGE_SIZE ?? '10',
      ),
      maxPageSize: parseInt(
        process.env.DATA_SOURCE_PAGINATION_MAX_PAGE_SIZE ?? '100',
      ),
    },
  },
} as const
