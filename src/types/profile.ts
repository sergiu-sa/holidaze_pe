import type { z } from 'zod'

import type { PaginationMetaSchema } from '../api/schemas'

export type { Profile } from '../api/schemas'
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
