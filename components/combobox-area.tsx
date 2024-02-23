'use client'

import { Query, getData } from '@/lib/data'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Combobox, ComboboxOption, ComboboxProps } from './combobox'
import { ucFirstStr } from '@/lib/utils'
import { Areas as BaseAreas, GetArea, singletonArea } from '@/lib/const'

type Areas = Exclude<BaseAreas, 'islands'>

function areaToOption<A extends Areas>(data: GetArea<A>): ComboboxOption {
  return {
    key: data.code,
    label: data.name,
    value: `${data.code}_${data.name}`,
  }
}

export type ComboboxAreaProps<A extends Areas> = Omit<
  ComboboxProps,
  'autoClose' | 'fullWidth' | 'options' | 'onSelect' | 'selected'
> & {
  area: A
  query?: Query<A>
  onSelect?: (option: GetArea<A>) => void
  selected?: GetArea<A> | null
}

export default function ComboboxArea<A extends Areas>({
  area,
  query,
  onSelect,
  selected,
  ...comboboxProps
}: ComboboxAreaProps<A>) {
  const [areas, setAreas] = useState<GetArea<A>[]>([])

  useEffect(() => {
    getData(area, { ...query, sortBy: 'name' })
      .then((res) => {
        if ('data' in res) return setAreas(res.data)
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
    <Combobox
      {...comboboxProps}
      options={areas.map((a) => areaToOption<A>(a))}
      label={comboboxProps.label || ucFirstStr(singletonArea[area])}
      placeholder={
        comboboxProps.placeholder || `Search ${ucFirstStr(singletonArea[area])}`
      }
      onSelect={(opt) => {
        const selectedArea = areas.find((a) => a.code === opt.key)
        if (selectedArea) {
          onSelect?.(selectedArea)
        }
      }}
      selected={selected ? areaToOption<A>(selected) : undefined}
      autoClose
      fullWidth
    />
  )
}
