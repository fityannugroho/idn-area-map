'use client'

import { useArea } from '@/hooks/useArea'
import {
  type Areas as BaseAreas,
  type GetArea,
  singletonArea,
} from '@/lib/const'
import type { Query } from '@/lib/data'
import { ucFirstStr } from '@/lib/utils'
import { toast } from 'sonner'
import { Combobox, type ComboboxOption, type ComboboxProps } from './combobox'

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
  const { data: areas = [], error } = useArea(area, {
    ...query,
    sortBy: 'name',
  })

  if (error) {
    toast.error(`Failed to fetch ${singletonArea[area]} data`, {
      description: error?.message,
      closeButton: true,
    })
  }

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
