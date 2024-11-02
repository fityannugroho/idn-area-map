'use client'

import {
  Combobox,
  type ComboboxOption,
  type ComboboxProps,
} from '@/components/combobox'
import { useArea } from '@/hooks/useArea'
import type { FeatureArea } from '@/lib/config'
import type { GetArea } from '@/lib/const'
import { ucFirstStr } from '@/lib/utils'
import { toast } from 'sonner'
import { useMapDashboard } from './hooks/useDashboard'

function areaToOption<A extends FeatureArea>(data: GetArea<A>): ComboboxOption {
  return {
    key: data.code,
    label: data.name,
    value: `${data.code}_${data.name}`,
  }
}

export type ComboboxAreaProps<A extends FeatureArea> = Omit<
  ComboboxProps,
  'autoClose' | 'fullWidth' | 'options' | 'onSelect' | 'selected'
> & {
  area: A
  onSelect?: (option: GetArea<A>) => void
}

export default function ComboboxArea<A extends FeatureArea>({
  area,
  onSelect,
  ...comboboxProps
}: ComboboxAreaProps<A>) {
  const { selectedArea, query } = useMapDashboard()
  const { data: areas = [], error } = useArea(area, {
    ...query[area],
    sortBy: 'name',
  })

  if (error) {
    toast.error(`Failed to fetch ${area} data`, {
      description: error?.message,
      closeButton: true,
    })
  }

  const areaData = selectedArea[area]

  return (
    <Combobox
      {...comboboxProps}
      options={areas.map((a) => areaToOption<A>(a))}
      label={comboboxProps.label || ucFirstStr(area)}
      placeholder={comboboxProps.placeholder || `Search ${ucFirstStr(area)}`}
      onSelect={(opt) => {
        const selectedArea = areas.find((a) => a.code === opt.key)
        if (selectedArea) {
          onSelect?.(selectedArea)
        }
      }}
      selected={areaData ? areaToOption(areaData) : undefined}
      autoClose
      fullWidth
    />
  )
}
