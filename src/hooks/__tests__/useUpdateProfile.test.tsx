import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { BASE } from '../../api/client'
import { clearSession, setSession } from '../../api/session'
import { server } from '../../test/msw/server'
import { AuthProvider, useAuth } from '../useAuth'
import { useUpdateProfile } from '../useUpdateProfile'

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'tester',
  email: 'tester@stud.noroff.no',
  venueManager: false,
}

const baseProfile = {
  name: 'tester',
  email: 'tester@stud.noroff.no',
  bio: null,
  avatar: { url: 'https://example.com/new.jpg', alt: 'New' },
  banner: { url: '', alt: '' },
  venueManager: false,
  _count: { venues: 0, bookings: 0 },
}

beforeEach(() => {
  clearSession()
  setSession(TEST_SESSION)
})

afterEach(() => {
  clearSession()
})

describe('useUpdateProfile', () => {
  it('PUTs the patch and writes through to AuthProvider state', async () => {
    server.use(
      http.put(`${BASE}/profiles/tester`, () =>
        HttpResponse.json({ data: baseProfile }),
      ),
    )

    const { result } = renderHook(
      () => ({ update: useUpdateProfile(), auth: useAuth() }),
      { wrapper: AuthProvider },
    )

    await act(async () => {
      await result.current.update.submit({
        avatar: { url: 'https://example.com/new.jpg', alt: 'New' },
      })
    })

    expect(result.current.auth.user?.avatar?.url).toBe('https://example.com/new.jpg')
    const raw = JSON.parse(localStorage.getItem('holidaze:v1:session')!) as {
      avatar?: { url?: string }
    }
    expect(raw.avatar?.url).toBe('https://example.com/new.jpg')
  })

  it('exposes pending state during the request', async () => {
    server.use(
      http.put(`${BASE}/profiles/tester`, async () => {
        await new Promise((r) => setTimeout(r, 20))
        return HttpResponse.json({ data: baseProfile })
      }),
    )

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: AuthProvider })
    let p: Promise<unknown> | undefined
    act(() => {
      p = result.current.submit({
        avatar: { url: 'https://example.com/new.jpg', alt: 'New' },
      })
    })
    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })
    await act(async () => {
      await p
    })
    expect(result.current.isPending).toBe(false)
  })

  it('exposes the error and does NOT touch session on failure', async () => {
    server.use(
      http.put(`${BASE}/profiles/tester`, () =>
        HttpResponse.json(
          { errors: [{ message: 'kaboom' }], status: 'Server Error', statusCode: 500 },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(
      () => ({ update: useUpdateProfile(), auth: useAuth() }),
      { wrapper: AuthProvider },
    )

    await expect(
      act(async () => {
        await result.current.update.submit({
          avatar: { url: 'https://example.com/new.jpg', alt: 'New' },
        })
      }),
    ).rejects.toThrow()

    expect(result.current.update.error).not.toBeNull()
    expect(result.current.auth.user?.avatar?.url).toBeFalsy()
  })

  it('throws if called while anonymous', async () => {
    clearSession()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: AuthProvider })
    await expect(
      act(async () => {
        await result.current.submit({
          avatar: { url: 'https://x', alt: 'x' },
        })
      }),
    ).rejects.toThrow()
  })
})
