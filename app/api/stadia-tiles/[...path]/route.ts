import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: RouteContext<'/api/stadia-tiles/[...path]'>,
) {
  const { path } = await params

  const apiKey = process.env.STADIA_API_KEY
  if (!apiKey) {
    return new Response('Missing STADIA_API_KEY', { status: 500 })
  }

  const upstreamUrl = new URL(
    `https://tiles.stadiamaps.com/tiles/${path.join('/')}`,
  )

  const incomingUrl = new URL(request.url)
  for (const [key, value] of incomingUrl.searchParams.entries()) {
    upstreamUrl.searchParams.set(key, value)
  }
  upstreamUrl.searchParams.set('api_key', apiKey)

  const upstreamResponse = await fetch(upstreamUrl)

  const headers = new Headers()
  const contentType = upstreamResponse.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const cacheControl = upstreamResponse.headers.get('cache-control')
  if (cacheControl) headers.set('cache-control', cacheControl)
  const expires = upstreamResponse.headers.get('expires')
  if (expires) headers.set('expires', expires)

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  })
}
