import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn, objectFromEntries } from '@/lib/utils'
import { useMemo } from 'react'
import { Pie, PieChart, ResponsiveContainer } from 'recharts'

type VotesPopupProps = {
  votes: VotesData
  candidates: {
    [candidateId: string]: Candidate
  }
  className?: string
  hideLegend?: boolean
}

export default function VotesChart({
  votes,
  candidates,
  className,
  hideLegend,
}: VotesPopupProps) {
  const candidateIds = Object.keys(candidates)

  const votesChartData = candidateIds.map((id) => ({
    candidate: `candidate${candidates[id].nomor_urut}`,
    votes: votes[id],
    fill: `var(--color-candidate${candidates[id].nomor_urut})`,
  }))

  const pollingStationChartData = [
    {
      status: 'finished',
      total: votes.progres.progres,
      fill: 'var(--color-finished)',
    },
    {
      status: 'notFinished',
      total: votes.progres.total - votes.progres.progres,
      fill: 'var(--color-notFinished)',
    },
  ]

  const chartConfig = {
    votes: {
      label: 'Votes',
    },
    ...objectFromEntries(
      candidateIds.map((id) => [
        `candidate${candidates[id].nomor_urut}`,
        {
          label: candidates[id].nama,
          color: `hsl(var(--chart-${candidates[id].nomor_urut}))`,
        },
      ]),
    ),
    total: {
      label: 'Polling Stations Progress',
    },
    finished: {
      label: `Finished (${votes.progres.persen}%)`,
      color: 'hsl(var(--ring))',
    },
    notFinished: {
      label: `Still Counting (${(100 - votes.progres.persen).toFixed(2)}%)`,
      color: 'hsl(var(--muted))',
    },
  } satisfies ChartConfig

  const totalVotes = useMemo(() => {
    return candidateIds.reduce((acc, id) => acc + votes[id], 0)
  }, [votes, candidateIds])

  return (
    <ChartContainer
      config={chartConfig}
      className={cn('mx-auto aspect-square min-h-[200px]', className)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />

          <Pie
            data={votesChartData}
            dataKey="votes"
            nameKey="candidate"
            className="cursor-pointer"
            outerRadius={70}
            labelLine={false}
            label={({ payload, ...props }) => {
              const RADIAN = Math.PI / 180
              const radius =
                props.innerRadius +
                (props.outerRadius - props.innerRadius) * 0.5
              const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN)
              const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN)

              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={x > props.cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fill="hsla(var(--foreground))"
                  className="text-xs"
                >
                  {/* Percentage */}
                  {((payload.votes / totalVotes) * 100).toFixed(2)}%{' '}
                </text>
              )
            }}
          />

          <Pie
            data={pollingStationChartData}
            dataKey="total"
            nameKey="status"
            innerRadius={80}
            outerRadius={90}
          />

          {!hideLegend && <ChartLegend content={<ChartLegendContent />} />}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
