import { setupServer } from 'msw/node'

// No global handlers — each test defines its own.
export const server = setupServer()
