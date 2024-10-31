import { Area } from '@/lib/const'
import { z } from 'zod'

export const paramSchema = z
  .object({
    /**
     * Area type
     */
    area: z.nativeEnum(Area),
    /**
     * Area code (numeric string)
     */
    code: z.string().regex(/^\d+$/),
  })
  .refine(
    (data) => {
      // Validate code length based on area type
      if (data.area === Area.PROVINCE) return data.code.length === 2
      if (data.area === Area.REGENCY) return data.code.length === 4
      if (data.area === Area.DISTRICT) return data.code.length === 6
      if (data.area === Area.VILLAGE) return data.code.length === 10
      return false
    },
    {
      message: 'Invalid code length',
    },
  )

export type Params = z.infer<typeof paramSchema>
