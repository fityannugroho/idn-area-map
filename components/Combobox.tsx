'use client'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ComboboxOption = {
  /**
   * The `key` must be unique.
   */
  key: string
  label: string
  /**
   * If `value` not set, `label` will be used instead.
   */
  value?: string | undefined
}

export type ComboboxProps = {
  autoClose?: boolean
  disabled?: boolean
  options: readonly ComboboxOption[]
  emptyMessage?: string
  /**
   * Set the width of the combobox match its parent width.
   *
   * This will override the `width` prop.
   *
   * @default false
   */
  fullWidth?: boolean
  /**
   * Set the max height of the combobox.
   *
   * @default '240px'
   */
  maxHeight?: string
  label?: string
  onSelect?: (option: ComboboxOption) => void
  placeholder?: string
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandInput>
  /**
   * Set the specific width of the combobox.
   *
   * Provide the width with the unit, e.g. `240px`, `2rem`, etc.
   */
  width?: string
  /**
   * The selected option.
   */
  selected?: ComboboxOption | null
}

export function Combobox({
  autoClose,
  disabled,
  options,
  emptyMessage = 'Nothing found',
  fullWidth,
  maxHeight = '240px',
  label = 'Select',
  onSelect,
  placeholder,
  inputProps,
  width,
  selected,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn('justify-between', fullWidth && 'w-full')}
          style={{
            width: fullWidth ? undefined : width,
          }}
        >
          <span className="truncate">{selected?.label ?? label}</span>
          <ChevronsUpDownIcon className="ml-1 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', fullWidth && 'w-full')}
        style={{
          width: fullWidth ? undefined : width,
        }}
      >
        <Command>
          <CommandInput
            {...inputProps}
            placeholder={placeholder || label}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup
              className={cn('overflow-y-auto')}
              style={{ maxHeight: maxHeight }}
            >
              {options.map((opt) => (
                <CommandItem
                  key={opt.key}
                  value={opt.value ?? opt.label}
                  onSelect={() => {
                    if (autoClose) {
                      setOpen(false)
                    }
                    onSelect?.(opt)
                  }}
                >
                  {opt.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto',
                      selected && selected.key === opt.key
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
