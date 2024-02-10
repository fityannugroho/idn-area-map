'use client'

import { Areas as BaseAreas, GetArea, Query, getData } from '@/lib/data'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Combobox, ComboboxProps } from './combobox'
import { ucFirstStr } from '@/lib/utils'

type Areas = Exclude<BaseAreas, 'islands'>

export type ComboboxAreaProps<A extends Areas> = Omit<
  ComboboxProps<GetArea<A>>,
  'autoClose' | 'fullWidth' | 'getOptionLabel' | 'options' | 'optionKey'
> & {
  area: A
  query?: Query<A>
}

const singletonArea: { [A in Areas]: string } = {
  provinces: 'province',
  regencies: 'regency',
  districts: 'district',
  villages: 'village',
}

export default function ComboboxArea<A extends Areas>({
  area,
  query,
  ...comboboxProps
}: ComboboxAreaProps<A>) {
  const [options, setOptions] = useState<GetArea<A>[]>([])

  useEffect(() => {
    getData(area, { ...query, sortBy: 'name' })
      .then((res) => {
        if ('data' in res) return setOptions(res.data)
        throw new Error(res.message[0])
      })
      .catch((err) => {
        toast.error(`Failed to fetch ${singletonArea[area]} data`, {
          description: err.message,
          closeButton: true,
        })
      })
  }, [area, query])

  return (
    // @ts-expect-error
    <Combobox
      {...comboboxProps}
      options={options}
      optionKey="code"
      getOptionLabel={(opt: { name: string }) => opt.name}
      label={comboboxProps.label || ucFirstStr(singletonArea[area])}
      placeholder={
        comboboxProps.placeholder || `Search ${ucFirstStr(singletonArea[area])}`
      }
      autoClose
      fullWidth
    />
  )
}
