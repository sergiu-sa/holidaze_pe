import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  clearSession,
  getAccessToken,
  getApiKey,
  getSession,
  setSession,
} from './session'

// ─── localStorage key (mirrors the constant in session.ts) ──────────────────

const STORAGE_KEY = 'holidaze:v1:session'

// jsdom provides a real localStorage — clear it and reset in-memory state
// before each test to prevent bleed.
beforeEach(() => {
  clearSession()
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

// ─── tests ──────────────────────────────────────────────────────────────────

describe('session — setSession', () => {
  it('stores in memory and in localStorage', () => {
    const session = { accessToken: 'tok', apiKey: 'key' }
    setSession(session)

    expect(getSession()).toEqual(session)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(session)
  })

  it('exposes getAccessToken and getApiKey after set', () => {
    setSession({ accessToken: 'tok', apiKey: 'key', name: 'alice' })

    expect(getAccessToken()).toBe('tok')
    expect(getApiKey()).toBe('key')
  })
})

describe('session — clearSession', () => {
  it('removes from memory and localStorage', () => {
    setSession({ accessToken: 'tok', apiKey: 'key' })
    clearSession()

    expect(getSession()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(getApiKey()).toBeNull()
  })
})

describe('session — localStorage round-trip', () => {
  it('setSession followed by clearSession leaves nothing in localStorage', () => {
    setSession({ accessToken: 'a', apiKey: 'b' })
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    clearSession()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('persists optional fields (name, email, venueManager) alongside required ones', () => {
    const session = {
      accessToken: 'tok',
      apiKey: 'key',
      name: 'bob',
      email: 'bob@stud.noroff.no',
      venueManager: true,
    }
    setSession(session)

    expect(getSession()).toEqual(session)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(session)
  })
})
