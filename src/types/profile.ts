import type { z } from 'zod'

import type { PaginationMetaSchema, ProfileSchema } from '../api/schemas'

export type Profile = z.infer<typeof ProfileSchema>
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
