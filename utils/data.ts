export type Province = {
  code: string
  name: string
}

export type Regency = {
  code: string
  name: string
  provinceCode: string
}

export type Island = {
  code: string
  name: string
  regencyCode: string
  coordinate: string
  isPopulated: boolean
  isOutermostSmall: boolean
  latitude: number
  longitude: number
}

const baseUrl = 'https://idn-area.up.railway.app'

export async function getProvinces(): Promise<Province[]> {
  const res = await fetch(`${baseUrl}/provinces?sortBy=name`)

  if (!res.ok) {
    throw new Error('Failed to fetch provinces data')
  }

  return res.json()
}

export async function getRegencies(provinceCode: string): Promise<Regency[]> {
  const res = await fetch(`${baseUrl}/provinces/${provinceCode}/regencies?sortBy=name`)

  if (!res.ok) {
    throw new Error('Failed to fetch regencies data')
  }

  return res.json()
}

export async function getIslands(regencyCode: string): Promise<Island[]> {
  const res = await fetch(`${baseUrl}/regencies/${regencyCode}/islands?sortBy=coordinate`)

  if (!res.ok) {
    throw new Error('Failed to fetch islands data')
  }

  return res.json()
}
