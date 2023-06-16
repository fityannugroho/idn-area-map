'use client'

import { Island, Province, Regency, getIslands, getProvinces, getRegencies } from '@/utils/data'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <p>Loading the map...</p>,
  ssr: false,
})

const MarkerClusterGroup = dynamic(() => import('@/components/Map/MarkerClusterGroup'), {
  ssr: false,
})

const MapMarker = dynamic(() => import('@/components/Map/Marker'), {
  ssr: false,
})

export default function MapDashboard() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setProvince] = useState<Province | null>(null)
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [selectedRegency, setRegency] = useState<Regency | null>(null)
  const [islands, setIslands] = useState<Island[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    getProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      getRegencies(selectedProvince.code).then(setRegencies)
    } else {
      setRegencies([])
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedRegency) {
      setLoading(true)
      getIslands(selectedRegency.code).then(setIslands)
        .finally(() => setLoading(false))
    } else {
      setIslands([])
    }
  }, [selectedRegency])

  return (
    <>
      <Box className='flex px-4 pt-4 pb-2 w-full gap-4 flex-wrap md:flex-nowrap'>
        <Autocomplete
          fullWidth
          size='small'
          options={provinces}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderOption={(props, option) => (
            <li {...props} key={option.code}>{option.name}</li>
          )}
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
          size='small'
          options={regencies}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderOption={(props, option) => (
            <li {...props} key={option.code}>{option.name}</li>
          )}
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
      <Box className='flex px-4 py-2 w-full justify-center text-gray-500 md:justify-between gap-3 flex-wrap'>
        {loading ? (
          <span className='text-sm text-gray-500'>
            Loading islands data...
          </span>
        ) : (
          <span className='text-sm font-semibold text-blue-700 w-fit'>
            {islands.length} islands found
          </span>
        )}
      </Box>

      {/* Map */}
      <Map
        className='h-[32rem]'
      >
        {islands.length && (
          <MarkerClusterGroup
            chunkedLoading
            chunkProgress={(progress, total) => setLoading(progress < total)}
          >
            {islands.map((island) => (
              <MapMarker
                key={island.code}
                position={[island.latitude, island.longitude]}
                title={island.name}
              >
                <b className='font-semibold text-blue-700 mb-2 block'>
                  {island.name}
                </b>

                <span className='text-xs text-gray-500 block'>
                  {island.coordinate}
                </span>

                {island.isPopulated && (
                  <span className='bg-green-500 text-white font-semibold text-xs rounded-full px-2 py-1 mt-2 me-1 inline-block'>
                    Populated
                  </span>
                )}
                {island.isOutermostSmall && (
                  <span className='bg-red-500 text-white font-semibold text-xs rounded-full px-2 py-1 mt-2 inline-block'>
                    Outermost Small Island
                  </span>
                )}
              </MapMarker>
            ))}
          </MarkerClusterGroup>
        )}
      </Map>
    </>
  )
}
