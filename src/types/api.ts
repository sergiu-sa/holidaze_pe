// ApiError extends Error so it can be thrown and caught with instanceof.
// The `status` and `details` fields are the Noroff-specific normalised shape.
export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}
