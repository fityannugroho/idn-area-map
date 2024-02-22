import { z } from 'zod'

export const areas = [
  'provinces',
  'regencies',
  'districts',
  'villages',
] as const

export const paramSchema = z
  .object({
    /**
     * Area type
     */
    area: z.enum(areas),
    /**
     * Area code (numeric string)
     */
    code: z.string().regex(/^\d+$/),
  })
  .refine(
    (data) => {
      // Validate code length based on area type
      if (data.area === 'provinces') return data.code.length === 2
      if (data.area === 'regencies') return data.code.length === 4
      if (data.area === 'districts') return data.code.length === 6
      if (data.area === 'villages') return data.code.length === 10
      return false
    },
    {
      message: 'Invalid code length',
    },
  )

export type Params = z.infer<typeof paramSchema>
