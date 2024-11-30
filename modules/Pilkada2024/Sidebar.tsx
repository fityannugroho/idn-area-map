'use client'

import { Combobox } from '@/components/combobox'
import { Button } from '@/components/ui/button'
import { config } from '@/lib/config'
import { Area } from '@/lib/const'
import type { Query } from '@/lib/data'
import { EraserIcon, LoaderCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import ComboboxArea from '../MapDashboard/ComboboxArea'
import { useMapDashboard } from '../MapDashboard/hooks/useDashboard'
import VotesChart from './VotesChart'
import {
  useCandidates,
  useElectionResults,
  usePilkada,
} from './hooks/usePilkada'

const electionOptions: readonly { key: ElectionType; label: string }[] = [
  { key: 'governor', label: 'Governor' },
  { key: 'regent', label: 'Regent' },
] as const

export default function Sidebar() {
  const { selectedArea, changeSelectedArea, clear } = useMapDashboard()
  const { election, setElection } = usePilkada()
  const [regencyQuery, setQuery] = useState<Query<Area.REGENCY>>({})

  const area = election === 'governor' ? 'province' : 'regency'
  const seleted = selectedArea[area]

  const { getCandidates, status: candidateStatus } = useCandidates({
    election: election || 'regent',
    enabled: election !== undefined && seleted !== undefined,
  })

  const {
    getRecap,
    status: electionStatus,
    fetchStatus,
    error,
  } = useElectionResults({
    election: election || 'regent',
    level: area,
    areaCode: seleted?.code || '',
    enabled: election !== undefined && seleted !== undefined,
  })

  if (error) {
    toast.error(`Can't find election data for ${seleted?.name}`, {
      description: error.message,
      closeButton: true,
    })
  }

  return (
    <div className="p-4 flex flex-col items-center gap-2">
      <Combobox
        label="Election Type"
        options={electionOptions}
        selected={electionOptions.find((o) => o.key === election)}
        onSelect={(option) => {
          setElection(option.key as ElectionType)
        }}
        fullWidth
        autoClose
      />

      <ComboboxArea
        area={Area.PROVINCE}
        query={{ limit: config.dataSource.area.pagination.maxPageSize }}
        disabled={!election}
        onSelect={(option) => {
          changeSelectedArea(Area.PROVINCE, option)
          setQuery((prevQuery) => ({
            ...prevQuery,
            parentCode: option.code,
            limit: config.dataSource.area.pagination.maxPageSize,
          }))
        }}
      />

      {election === 'regent' && (
        <ComboboxArea
          area={Area.REGENCY}
          query={regencyQuery}
          disabled={!selectedArea.province}
          onSelect={(option) => {
            changeSelectedArea(Area.REGENCY, option)
          }}
        />
      )}

      {fetchStatus === 'fetching' && (
        <div className="p-4">
          <LoaderCircleIcon className="h-6 w-6 animate-spin" />
        </div>
      )}

      {seleted &&
        candidateStatus === 'success' &&
        electionStatus === 'success' && (
          <VotesChart
            votes={getRecap()}
            candidates={getCandidates(seleted.code)}
            className="h-[380px] w-full"
          />
        )}

      <Button
        variant="outline"
        className="mt-auto items-center"
        onClick={() => {
          clear()
        }}
      >
        <EraserIcon />
        Clear All Data
      </Button>
    </div>
  )
}
