'use client'

import { useArea } from '@/hooks/useArea'
import { config } from '@/lib/config'
import { Area } from '@/lib/const'
import dynamic from 'next/dynamic'
import type { ReactElement } from 'react'
import AreaBoundary from '../MapDashboard/AreaBoundary'
import VotesChart from './VotesChart'
import { useCandidates, useElectionResults } from './hooks/usePilkada'

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

export type BoundaryLayersProps = {
  election: ElectionType
  code: string
}

export default function BoundaryLayers({
  election,
  code: parentCode,
}: BoundaryLayersProps) {
  const childArea = election === 'governor' ? Area.REGENCY : Area.DISTRICT
  const { data: childAreas = [], status: areaStatus } = useArea(childArea, {
    parentCode,
    limit: config.dataSource.area.pagination.maxPageSize,
  })

  const { getCandidates, status: governorDataStatus } = useCandidates({
    election,
  })

  const { getVotesByArea, status: electionDataStatus } = useElectionResults({
    election,
    level: election === 'governor' ? 'province' : 'regency',
    areaCode: parentCode,
  })

  if (
    areaStatus !== 'success' ||
    governorDataStatus !== 'success' ||
    electionDataStatus !== 'success'
  ) {
    return null
  }

  const candidates = getCandidates(parentCode)

  // Render all inner areas with the data
  return (
    <>
      {childAreas.map((_childArea) => {
        const votes = getVotesByArea(_childArea.code)

        // Calculate the winner
        const winner = Object.keys(candidates).reduce((acc, id) => {
          if (votes[id] > votes[acc]) {
            return id
          }
          return acc
        })

        return (
          <AreaBoundary
            area={childArea}
            key={_childArea.code}
            code={_childArea.code}
            pathOptions={{
              color: `hsl(var(--chart-${candidates[winner].nomor_urut}))`,
            }}
            render={() => (
              <Popup pane="popupPane">
                <h1 className="font-bold mb-2">{_childArea.name}</h1>
                <VotesChart
                  votes={votes}
                  candidates={candidates}
                  hideLegend
                  className="w-[240px]"
                />
              </Popup>
            )}
          />
        )
      })}
    </>
  )
}
