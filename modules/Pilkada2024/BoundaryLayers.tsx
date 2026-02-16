'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import AreaBoundary from '@/components/AreaBoundary'
import { useArea } from '@/hooks/useArea'
import { config } from '@/lib/config'
import { Area } from '@/lib/const'
import { useMapDashboard } from '../MapDashboard/hooks/useDashboard'
import { useCandidates, useElectionResults } from './hooks/usePilkada'
import type { ElectionType } from './types'
import VotesChart from './VotesChart'

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

export type BoundaryLayersProps = {
  election: ElectionType
  code: string
}

const MIN_OPACITY = 0.1
const MAX_OPACITY = 0.7
const EXPONENT = 2

export default function BoundaryLayers({
  election,
  code: parentCode,
}: BoundaryLayersProps) {
  const childArea = election === 'governor' ? Area.REGENCY : Area.DISTRICT
  const { setAreaBounds } = useMapDashboard()
  const { data: childAreas = [], status: areaStatus } = useArea(childArea, {
    parentCode,
    limit: config.dataSource.area.pagination.maxPageSize,
  })

  const { getCandidates, status: governorDataStatus } = useCandidates({
    election,
  })

  const {
    data: electionData,
    getVotesByArea,
    status: electionDataStatus,
  } = useElectionResults({
    election,
    level: election === 'governor' ? 'province' : 'regency',
    areaCode: parentCode,
  })

  const isReady =
    areaStatus === 'success' &&
    governorDataStatus === 'success' &&
    electionDataStatus === 'success'

  // Pre-compute candidates (stable reference from React Query structural sharing)
  const candidates = isReady ? getCandidates(parentCode) : undefined

  // Memoize expensive vote computation across all child areas
  // biome-ignore lint/correctness/useExhaustiveDependencies: getVotesByArea is an unstable closure over electionData; we track electionData directly for correctness
  const computedAreas = useMemo(() => {
    if (!candidates || !electionData) return null

    const candidateIds = Object.keys(candidates)

    return childAreas.map((_childArea) => {
      const votes = getVotesByArea(_childArea.code)

      const numericVotes = candidateIds.map((id) => ({
        id,
        val: votes[id] as number,
      }))

      // Sort descending to get winner and runner-up
      numericVotes.sort((a, b) => b.val - a.val)
      const winnerId = numericVotes[0]?.id
      const winnerVal = numericVotes[0].val
      const runnerUpVal = numericVotes[1]?.val ?? 0

      const total = numericVotes.reduce((s, x) => s + x.val, 0)

      // Compute margin = winnerShare - runnerUpShare, in [0,1]
      const winnerShare = winnerVal / total
      const runnerUpShare = runnerUpVal / total
      const margin = Math.max(0, winnerShare - runnerUpShare)

      // Emphasize large margins using power > 1
      const transformed = Math.max(0, Math.min(1, margin)) ** EXPONENT

      return {
        area: _childArea,
        votes,
        winnerId,
        fillOpacity: MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * transformed,
      }
    })
  }, [childAreas, candidates, electionData])

  if (!computedAreas || !candidates) {
    return null
  }

  return (
    <>
      {computedAreas.map(
        ({ area: _childArea, votes, winnerId, fillOpacity }) => (
          <AreaBoundary
            area={childArea}
            key={_childArea.code}
            code={_childArea.code}
            pathOptions={{
              color: `var(--chart-${candidates[winnerId].nomor_urut})`,
              fillColor: `var(--chart-${candidates[winnerId].nomor_urut})`,
              fillOpacity,
            }}
            eventHandlers={{
              add: (e) => {
                // Fly to the first child area
                if (_childArea.code === childAreas[0].code) {
                  setAreaBounds(e.target.getBounds())
                }
              },
            }}
          >
            <Popup pane="popupPane">
              <h1 className="font-bold mb-2">{_childArea.name}</h1>
              <VotesChart
                votes={votes}
                candidates={candidates}
                hideLegend
                className="w-[240px]"
              />
            </Popup>
          </AreaBoundary>
        ),
      )}
    </>
  )
}
