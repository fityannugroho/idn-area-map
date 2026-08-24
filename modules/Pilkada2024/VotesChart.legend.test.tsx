import { render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegendContent,
} from '@/components/ui/chart'

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }
})

const chartConfig = {
  votes: { label: 'Votes' },
  candidate1: { label: 'Paslon Satu' },
  candidate2: { label: 'Paslon Dua' },
  total: { label: 'Polling Stations Progress' },
  finished: { label: 'Finished (75%)' },
  notFinished: { label: 'Still Counting (25%)' },
} satisfies ChartConfig

// Mirrors the recharts v3 LegendPayload items produced by VotesChart:
// the votes Pie (dataKey="votes", nameKey="candidate") and the polling
// stations progress Pie (dataKey="total", nameKey="status").
const mockPayload = [
  {
    value: 'candidate1',
    dataKey: 'votes',
    payload: { candidate: 'candidate1', votes: 100 },
    color: '#f00',
  },
  {
    value: 'candidate2',
    dataKey: 'votes',
    payload: { candidate: 'candidate2', votes: 50 },
    color: '#00f',
  },
  {
    value: 'finished',
    dataKey: 'total',
    payload: { status: 'finished', total: 150 },
    color: '#0f0',
  },
  {
    value: 'notFinished',
    dataKey: 'total',
    payload: { status: 'notFinished', total: 50 },
    color: '#888',
  },
]

describe('ChartLegendContent (VotesChart legend)', () => {
  test('renders candidate names and polling station statuses', () => {
    const { container } = render(
      <ChartContainer config={chartConfig}>
        <ChartLegendContent payload={mockPayload} />
      </ChartContainer>,
    )

    const items = container.querySelectorAll('.gap-2 > div')
    const labels = Array.from(items).map((item) => item.textContent)

    expect(labels).toEqual([
      'Paslon Satu',
      'Paslon Dua',
      'Finished (75%)',
      'Still Counting (25%)',
    ])
  })
})
