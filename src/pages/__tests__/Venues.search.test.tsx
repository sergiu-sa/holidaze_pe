import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BASE } from '../../api/client'
import { server } from '../../test/msw/server'
import Venues from '../Venues'

const setSearchParamsMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(''), setSearchParamsMock],
  }
})

function renderVenues() {
  return render(
    <MemoryRouter initialEntries={['/venues']}>
      <Venues />
    </MemoryRouter>,
  )
}

describe('Venues search history', () => {
  beforeEach(() => {
    setSearchParamsMock.mockClear()
    server.use(
      http.get(`${BASE}/venues`, () =>
        HttpResponse.json({
          data: [],
          meta: {
            isFirstPage: true,
            isLastPage: true,
            currentPage: 1,
            previousPage: null,
            nextPage: null,
            pageCount: 1,
            totalCount: 0,
          },
        }),
      ),
    )
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('updates the q param with replace so typing does not stack history', async () => {
    renderVenues()
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'os')

    const lastCall = setSearchParamsMock.mock.calls.at(-1)
    expect(lastCall?.[1]).toEqual({ replace: true })
  })
})
