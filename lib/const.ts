export type Province = {
  code: string
  name: string
}

export type Regency = {
  code: string
  name: string
  provinceCode: string
}

export type District = {
  code: string
  name: string
  regencyCode: string
}

export type Village = {
  code: string
  districtCode: string
  name: string
}

export type Island = {
  code: string
  coordinate: string
  isOutermostSmall: boolean
  isPopulated: boolean
  latitude: number
  longitude: number
  name: string
  regencyCode: string | null
}

export type Areas =
  | 'provinces'
  | 'regencies'
  | 'districts'
  | 'villages'
  | 'islands'

export type GetArea<Area> = Area extends 'provinces'
  ? Province
  : Area extends 'regencies'
    ? Regency
    : Area extends 'islands'
      ? Island
      : Area extends 'districts'
        ? District
        : Area extends 'villages'
          ? Village
          : never

export const singletonArea: { readonly [A in Areas]: string } = {
  provinces: 'province',
  regencies: 'regency',
  islands: 'island',
  districts: 'district',
  villages: 'village',
} as const

export const parentArea: { readonly [A in Areas]?: Areas } = {
  regencies: 'provinces',
  islands: 'regencies',
  districts: 'regencies',
  villages: 'districts',
} as const
