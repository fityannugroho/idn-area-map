'use client'

import {
  Combobox,
  type ComboboxOption,
  type ComboboxProps,
} from '@/components/Combobox'
import { useArea } from '@/hooks/useArea'
import type { FeatureArea } from '@/lib/config'
import type { GetArea } from '@/lib/const'
import type { Query } from '@/lib/data'
import { ucFirstStr } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

function areaToOption<A extends FeatureArea>(data: GetArea<A>): ComboboxOption {
  return {
    key: data.code,
    label: data.name,
    value: `${data.code}_${data.name}`,
  }
}

export type ComboboxAreaProps<A extends FeatureArea> = Omit<
  ComboboxProps,
  'options' | 'onSelect' | 'selected'
> & {
  area: A
  query: Query<A>
  onSelect?: (option: GetArea<A>) => void
}

export default function ComboboxArea<A extends FeatureArea>({
  area,
  query,
  onSelect,
  ...comboboxProps
}: ComboboxAreaProps<A>) {
  const [selectedArea, setSelectedArea] = useState<GetArea<A> | undefined>()
  const { data: areas = [], error } = useArea(area, {
    ...query,
    sortBy: 'name',
  })

  const options = useMemo(() => areas.map((a) => areaToOption<A>(a)), [areas])

  if (error) {
    toast.error(`Failed to fetch ${area} data`, {
      description: error?.message,
      closeButton: true,
    })
  }

  return (
    <Combobox
      {...comboboxProps}
      options={options}
      label={comboboxProps.label || ucFirstStr(area)}
      placeholder={comboboxProps.placeholder || `Search ${ucFirstStr(area)}`}
      onSelect={(opt) => {
        const selectedArea = areas.find((a) => a.code === opt.key)
        if (selectedArea) {
          setSelectedArea(selectedArea)
          onSelect?.(selectedArea)
        }
      }}
      selected={selectedArea ? areaToOption(selectedArea) : undefined}
    />
  )
}
