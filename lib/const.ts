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

export enum Area {
  PROVINCE = 'province',
  REGENCY = 'regency',
  DISTRICT = 'district',
  VILLAGE = 'village',
  ISLAND = 'island',
}

export const endpoints = {
  [Area.PROVINCE]: 'provinces',
  [Area.REGENCY]: 'regencies',
  [Area.DISTRICT]: 'districts',
  [Area.VILLAGE]: 'villages',
  [Area.ISLAND]: 'islands',
}

export type GetArea<Area> = Area extends Area.PROVINCE
  ? Province
  : Area extends Area.REGENCY
    ? Regency
    : Area extends Area.ISLAND
      ? Island
      : Area extends Area.DISTRICT
        ? District
        : Area extends Area.VILLAGE
          ? Village
          : never

export const parentArea: { readonly [A in Area]?: Area } = {
  [Area.REGENCY]: Area.PROVINCE,
  [Area.ISLAND]: Area.REGENCY,
  [Area.DISTRICT]: Area.REGENCY,
  [Area.VILLAGE]: Area.DISTRICT,
} as const

export const childArea: { readonly [A in Area]?: Area } = {
  [Area.PROVINCE]: Area.REGENCY,
  [Area.REGENCY]: Area.DISTRICT,
  [Area.DISTRICT]: Area.VILLAGE,
}
