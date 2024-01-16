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

type Option = Record<keyof any, unknown> | string

export type ComboboxProps<T extends Option> = {
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
   * Set the max height of the combobox.
   *
   * @default '240px'
   */
  maxHeight?: string
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
  /**
   * Set the value of the combobox.
   */
  value?: T | null
} & (T extends string
  ? {}
  : {
      /**
       * Set the key of the option.
       */
      optionKey: keyof T
      /**
       * Set the label of the option.
       */
      getOptionLabel: (option: T) => string
    })

export function Combobox<T extends Option>({
  autoClose,
  options,
  emptyMessage = 'Nothing found',
  fullWidth,
  // @ts-ignore
  optionKey,
  // @ts-ignore
  getOptionLabel,
  maxHeight = '240px',
  label = 'Select',
  onSelect,
  placeholder,
  inputProps,
  width,
  value,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', fullWidth && 'w-full')}
          style={{
            width: fullWidth ? undefined : width,
          }}
        >
          <span className="truncate">
            {value
              ? typeof value === 'string'
                ? value
                : getOptionLabel(value)
              : label}
          </span>
          <CaretSortIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
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
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup
            className={cn('overflow-y-auto')}
            style={{ maxHeight: maxHeight }}
          >
            {options.map((opt) => (
              <CommandItem
                key={typeof opt === 'string' ? opt : `${opt[optionKey]}`}
                value={
                  typeof opt === 'string'
                    ? opt
                    : `${opt[optionKey]}_${getOptionLabel(opt)}`
                }
                onSelect={() => {
                  if (autoClose) {
                    setOpen(false)
                  }
                  onSelect?.(opt)
                }}
              >
                {typeof opt === 'string' ? opt : getOptionLabel(opt)}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value &&
                      (typeof value === 'string'
                        ? value === opt
                        : value[optionKey] === opt[optionKey])
                      ? 'opacity-100'
                      : 'opacity-0',
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
