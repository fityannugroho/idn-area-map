import { config } from './config'

export type Province = {
  id: string
  code: string
  name: string
}

export type Regency = {
  id: string
  code: string
  name: string
  provinceCode: string
}

export type Island = {
  id: string
  code: string
  name: string
  regencyCode: string
  coordinate: string
  isPopulated: boolean
  isOutermostSmall: boolean
  latitude: number
  longitude: number
}

const baseUrl = config.dataSourceUrl

export async function getProvinces(): Promise<Province[]> {
  const res = await fetch(`${baseUrl}/provinces?sortBy=name&limit=100`)

  if (!res.ok) {
    throw new Error('Failed to fetch provinces data')
  }

  return (await res.json()).data
}

export async function getRegencies(provinceCode: string): Promise<Regency[]> {
  const res = await fetch(`${baseUrl}/regencies?provinceCode=${provinceCode}&limit=100&sortBy=name`)

  if (!res.ok) {
    throw new Error('Failed to fetch regencies data')
  }

  return (await res.json()).data
}

export async function getIslands(regencyCode: string): Promise<Island[]> {
  const res = await fetch(`${baseUrl}/islands?regencyCode=${regencyCode}&limit=100&sortBy=coordinate`)

  if (!res.ok) {
    throw new Error('Failed to fetch islands data')
  }

  return (await res.json()).data
}
