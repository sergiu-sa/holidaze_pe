import { z } from 'zod'

// Noroff error envelope: { errors: [{ message, code?, path? }], status?, statusCode? }
// Used in client.ts to safeParse non-OK response bodies before mapping to ApiError.
export const NoroffErrorEnvelopeSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
      path: z.array(z.string()).optional(),
    }),
  ),
  status: z.string().optional(),
  statusCode: z.number().optional(),
})

export type NoroffErrorEnvelope = z.infer<typeof NoroffErrorEnvelopeSchema>
