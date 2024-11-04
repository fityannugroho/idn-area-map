import { config } from '@/lib/config'
import { endpoints } from '@/lib/const'
import { objectFromEntries, objectToEntries } from '@/lib/utils'
import { http, HttpResponse } from 'msw'
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

    if (name) {
      return HttpResponse.json({
        data: items.filter((item) =>
          item.name.toLowerCase().includes(name.toLowerCase()),
        ),
      })
    }

    return HttpResponse.json({ data: items })
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
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json({ data })
  }),
]
