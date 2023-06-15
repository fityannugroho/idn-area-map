'use client'

import { Island, Province, Regency, getIslands, getRegencies } from '@/utils/data'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

export default function MapDashboard({
  provinces,
}: {
  provinces: Province[],
}) {
  const [selectedProvince, setProvince] = useState<Province | null>(null)
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [selectedRegency, setRegency] = useState<Regency | null>(null)
  const [islands, setIslands] = useState<Island[]>([])

  const Map = useMemo(() => (
    dynamic(() => import('@/components/Map'), {
      loading: () => <p>Loading the map...</p>,
      ssr: false,
    })
  ), [])

  useEffect(() => {
    if (selectedProvince) {
      getRegencies(selectedProvince.code).then(setRegencies)
    } else {
      setRegencies([])
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedRegency) {
      getIslands(selectedRegency.code).then(setIslands)
    } else {
      setIslands([])
    }
  }, [selectedRegency])

  return (
    <>
      <Box className='flex px-4 pt-4 pb-2 w-full gap-3 flex-wrap md:flex-nowrap'>
        <Autocomplete
          fullWidth
          options={provinces}
          getOptionLabel={(option) => option.name}
          renderInput={(param) => (
            <TextField
              {...param}
              label='Province'
              placeholder='Select a province'
              name='province'
            />
          )}
          value={selectedProvince}
          onChange={(event, newValue) => {
            setProvince(newValue)
          }}
        />
        <Autocomplete
          fullWidth
          options={regencies}
          getOptionLabel={(option) => option.name}
          renderInput={(param) => (
            <TextField
              label='Regency'
              placeholder='Select a regency'
              name='regency'
              {...param}
            />
          )}
          value={selectedRegency}
          onChange={(event, newValue) => {
            setRegency(newValue)
          }}
        />
      </Box>

      {/* Islands info */}
      <Box className='flex px-4 py-3 w-full justify-center text-gray-500 md:justify-between gap-3 flex-wrap'>
        <span className='text-sm font-semibold text-blue-700 w-fit'>
          {islands.length} islands found
        </span>
      </Box>

      {/* Map */}
      <Map
        className='h-[32rem]'
        markers={islands.map((island) => ({
          key: island.code,
          position: [island.latitude, island.longitude],
          children: <>
            <b>{island.name}</b>
            <p>{island.latitude}</p>
            <p>{island.longitude}</p>
            {island.isPopulated && (
              <p>Populated</p>
            )}
            {island.isOutermostSmall && (
              <p>Outermost Small Island</p>
            )}
          </>,
        }))}
      />
    </>
  )
}
