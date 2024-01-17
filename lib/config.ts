export type Config = {
  appName: string
  appDescription: string
  dataSourceUrl?: string
}

export const config: Config = {
  appName: 'idn-area Map',
  appDescription: 'Map of Indonesia Area',
  dataSourceUrl: process.env.NEXT_PUBLIC_DATA_SOURCE_URL,
}
