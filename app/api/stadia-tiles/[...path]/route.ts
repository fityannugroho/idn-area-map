import type { NextRequest } from 'next/server'

function parsePositiveInt(value: string | undefined) {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext<'/api/stadia-tiles/[...path]'>,
) {
  const { path } = await params

  const apiKey = process.env.STADIA_API_KEY
  if (!apiKey) {
    return new Response('Missing STADIA_API_KEY', { status: 500 })
  }

  const maxAgeSeconds =
    parsePositiveInt(process.env.TILE_CACHE_MAX_AGE) ?? 60 * 60 * 24
  const staleWhileRevalidateSeconds =
    parsePositiveInt(process.env.TILE_CACHE_STALE_WHILE_REVALIDATE) ??
    60 * 60 * 24 * 7

  const upstreamUrl = new URL(
    `https://tiles.stadiamaps.com/tiles/${path.join('/')}`,
  )

  const incomingUrl = new URL(request.url)
  for (const [key, value] of incomingUrl.searchParams.entries()) {
    upstreamUrl.searchParams.set(key, value)
  }
  upstreamUrl.searchParams.set('api_key', apiKey)

  const upstreamResponse = await fetch(upstreamUrl, {
    cache: maxAgeSeconds > 0 ? 'force-cache' : 'no-store',
    next: maxAgeSeconds > 0 ? { revalidate: maxAgeSeconds } : undefined,
  })

  const headers = new Headers()
  const contentType = upstreamResponse.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const etag = upstreamResponse.headers.get('etag')
  if (etag) headers.set('etag', etag)
  const lastModified = upstreamResponse.headers.get('last-modified')
  if (lastModified) headers.set('last-modified', lastModified)

  if (upstreamResponse.ok && maxAgeSeconds > 0) {
    headers.set(
      'cache-control',
      `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    )
  } else {
    headers.set('cache-control', 'no-store')
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  })
}
