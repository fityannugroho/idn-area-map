import { HttpResponse, http } from 'msw'
import { config } from '@/lib/config'
import { Area, endpoints, type GetArea } from '@/lib/const'
import { objectFromEntries, objectToEntries } from '@/lib/utils'
import { mockData } from './const'

const AREA_API_URL = config.dataSource.area.url

// Swap key and value of endpoints object
const areaByEndpoint = objectFromEntries(
  objectToEntries(endpoints).map(([key, value]) => [value, key]),
)

export const handlers = [
  http.get(`${AREA_API_URL}/:area`, ({ params, request }) => {
    const { area: endpoint } = params
    const url = new URL(request.url)
    const name = url.searchParams.get('name')

    if (typeof endpoint !== 'string') {
      return HttpResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    const items = mockData[areaByEndpoint[endpoint]]

    const filtered = name
      ? items.filter((item) =>
          item.name.toLowerCase().includes(name.toLowerCase()),
        )
      : items

    // Build meta object similar to upstream API
    const meta = {
      total: filtered.length,
      pagination: {
        total: filtered.length,
        pages: {
          first: 1,
          last: 1,
          current: 1,
          previous: null,
          next: null,
        },
      },
    }

    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: filtered,
      meta,
    })
  }),

  http.get(`${AREA_API_URL}/:area/:code`, ({ params }) => {
    const { area: endpoint, code } = params

    if (typeof endpoint !== 'string') {
      return HttpResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    const data = mockData[areaByEndpoint[endpoint]].find(
      (item) => item.code === code,
    )

    if (!data) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Not found', error: 'Not found' },
        { status: 404 },
      )
    }

    // Compute parent chain based on area type and attach to data
    const areaKey = areaByEndpoint[endpoint] as Area

    // typed mock lookup based on Area -> GetArea mapping
    const mockLookup = mockData as unknown as {
      [K in Area]: ReadonlyArray<GetArea<K>>
    }

    const findBy = <K extends Area>(
      aKey: K,
      codeToFind?: string | null,
    ): GetArea<K> | undefined => {
      if (!codeToFind) return undefined
      const list = mockLookup[aKey]
      return list.find((it) => (it as { code: string }).code === codeToFind) as
        | GetArea<K>
        | undefined
    }

    type ParentShape = Partial<{
      province: GetArea<Area.PROVINCE>
      regency: GetArea<Area.REGENCY>
      district: GetArea<Area.DISTRICT>
    }>

    let parent: ParentShape | undefined

    if (areaKey === Area.REGENCY) {
      const province = findBy(
        Area.PROVINCE,
        (data as { provinceCode?: string }).provinceCode ?? null,
      )
      parent = province ? { province } : undefined
    } else if (areaKey === Area.DISTRICT) {
      const regency = findBy(
        Area.REGENCY,
        (data as { regencyCode?: string }).regencyCode ?? null,
      )
      const province = regency
        ? findBy(
            Area.PROVINCE,
            (regency as { provinceCode?: string }).provinceCode ?? null,
          )
        : undefined
      parent = {}
      if (regency) parent.regency = regency
      if (province) parent.province = province
    } else if (areaKey === Area.VILLAGE) {
      const district = findBy(
        Area.DISTRICT,
        (data as { districtCode?: string }).districtCode ?? null,
      )
      const regency = district
        ? findBy(
            Area.REGENCY,
            (district as { regencyCode?: string }).regencyCode ?? null,
          )
        : undefined
      const province = regency
        ? findBy(
            Area.PROVINCE,
            (regency as { provinceCode?: string }).provinceCode ?? null,
          )
        : undefined
      parent = {}
      if (district) parent.district = district
      if (regency) parent.regency = regency
      if (province) parent.province = province
    } else if (areaKey === Area.ISLAND) {
      const regency = findBy(
        Area.REGENCY,
        (data as { regencyCode?: string }).regencyCode ?? null,
      )
      const province = regency
        ? findBy(
            Area.PROVINCE,
            (regency as { provinceCode?: string }).provinceCode ?? null,
          )
        : undefined
      parent = {}
      if (regency) parent.regency = regency
      if (province) parent.province = province
    }

    const dataWithParent = parent ? { ...(data as object), parent } : data

    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: dataWithParent,
    })
  }),
]
