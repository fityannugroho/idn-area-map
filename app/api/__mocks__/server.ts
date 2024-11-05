import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const mockServer = setupServer(...handlers)

mockServer.events.on('request:start', async ({ request }) => {
  console.log(`Request to ${request.url.toString()}`)
})
