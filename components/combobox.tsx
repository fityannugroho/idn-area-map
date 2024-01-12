'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import * as React from 'react'

type RequiredProperties<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

type Props<T> = {
  autoClose?: boolean
  options: readonly T[]
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
   * Set the label of the option.
   *
   * @default (option) => option
   */
  getOptionLabel?: (option: T) => string
  /**
   * Set the max height of the combobox.
   *
   * @default '240px'
   */
  maxHeight?: string
  /**
   * Used to determine if the option is equal to the value. Uses strict equality by default.
   *
   * @default (option, value) => option === value
   */
  isOptionEqualToValue?: (option: T, value: T) => boolean
  label?: string
  onSelect?: (option: T) => void
  placeholder?: string
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandInput>
  /**
   * Set the specific width of the combobox.
   *
   * Provide the width with the unit, e.g. `240px`, `2rem`, etc.
   */
  width?: string
}

export type ComboboxProps<T> = T extends string ? Props<T> : RequiredProperties<
  Props<T>, 'isOptionEqualToValue' | 'getOptionLabel'
>

export function Combobox<T>({
  autoClose,
  options,
  emptyMessage = 'Nothing found',
  fullWidth,
  getOptionLabel = (option) => option,
  maxHeight = '240px',
  isOptionEqualToValue = (option, value) => option === value,
  label = 'Select',
  onSelect,
  placeholder,
  inputProps,
  width,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<T>()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between',
            fullWidth && 'w-full',
          )}
          style={{
            width: fullWidth ? undefined : width,
          }}
        >
          <span className="truncate">
            {selected ? getOptionLabel(selected) : label}
          </span>
          <CaretSortIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0',
          fullWidth && 'w-full',
        )}
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
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup
            className={cn(
              'overflow-y-auto',
            )}
            style={{ maxHeight: maxHeight }}
          >
            {options.map((opt) => (
              <CommandItem
                key={getOptionLabel(opt)}
                value={getOptionLabel(opt)}
                onSelect={() => {
                  setSelected(opt)
                  if (autoClose) {
                    setOpen(false)
                  }
                  onSelect?.(opt)
                }}
              >
                {getOptionLabel(opt)}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    selected && isOptionEqualToValue(selected, opt) ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
