import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { createApiKey, login as apiLogin, register as apiRegister } from '../api/auth'
import { clearSession, getSession, type Session, setSession } from '../api/session'
import { ApiError } from '../types/api'

export interface AuthenticatedUser {
  name: string
  email: string
  avatar?: { url: string; alt: string }
  banner?: { url: string; alt: string }
  venueManager: boolean
}

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous'; user: null }
  | { status: 'authenticated'; user: AuthenticatedUser }

export interface AuthApi {
  state: AuthState
  user: AuthenticatedUser | null
  login: (input: { email: string; password: string }) => Promise<void>
  register: (input: {
    name: string
    email: string
    password: string
    venueManager: boolean
  }) => Promise<void>
  logout: () => void
  refreshApiKey: () => Promise<void>
  applyProfilePatch: (patch: {
    avatar?: { url: string; alt: string }
    banner?: { url: string; alt: string }
    bio?: string | null
    venueManager?: boolean
  }) => void
}

const AuthContext = createContext<AuthApi | null>(null)

const STORAGE_KEY = 'holidaze:v1:session'

function sessionToUser(session: Session): AuthenticatedUser | null {
  if (!session.accessToken || !session.apiKey || !session.name || !session.email) {
    return null
  }
  return {
    name: session.name,
    email: session.email,
    venueManager: session.venueManager ?? false,
    avatar: session.avatar,
    banner: session.banner,
  }
}

// Resolve boot state synchronously so guards never see a `loading` flicker on
// first render. Partial or corrupt sessions are discarded.
function bootState(): AuthState {
  const session = getSession()
  if (!session) return { status: 'anonymous', user: null }
  const user = sessionToUser(session)
  if (!user) {
    clearSession()
    return { status: 'anonymous', user: null }
  }
  return { status: 'authenticated', user }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(bootState)

  // Cross-tab sync. session.ts's in-memory cache isn't updated by writes from
  // another tab, so read the truth from event.newValue (null = key removed).
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return
      if (event.newValue === null) {
        clearSession()
        setState({ status: 'anonymous', user: null })
        return
      }
      let parsed: Session
      try {
        parsed = JSON.parse(event.newValue) as Session
      } catch {
        clearSession()
        setState({ status: 'anonymous', user: null })
        return
      }
      const user = sessionToUser(parsed)
      if (user) {
        // Sync in-memory cache so getSession() agrees with localStorage.
        setSession(parsed)
        setState({ status: 'authenticated', user })
      } else {
        clearSession()
        setState({ status: 'anonymous', user: null })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const login = useCallback<AuthApi['login']>(async (input) => {
    // On any failure, clear both stores so localStorage and React state agree.
    let userData: Awaited<ReturnType<typeof apiLogin>>
    try {
      userData = await apiLogin(input)
    } catch (err) {
      clearSession()
      setState({ status: 'anonymous', user: null })
      throw err
    }

    let key: string
    try {
      key = await createApiKey(userData.accessToken)
    } catch (err) {
      clearSession()
      setState({ status: 'anonymous', user: null })
      throw err
    }

    setSession({
      accessToken: userData.accessToken,
      apiKey: key,
      name: userData.name,
      email: userData.email,
      venueManager: userData.venueManager,
      avatar: userData.avatar,
      banner: userData.banner,
    })
    setState({
      status: 'authenticated',
      user: {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        banner: userData.banner,
        venueManager: userData.venueManager,
      },
    })
  }, [])

  const register = useCallback<AuthApi['register']>(
    async (input) => {
      // Noroff /auth/register returns no accessToken, so chain into login.
      // If the auto-login leg fails, tag the error so RegisterForm can fall
      // back to redirecting the user to /login?email=…
      await apiRegister(input)
      try {
        await login({ email: input.email, password: input.password })
      } catch (err) {
        const tagged = new ApiError(
          err instanceof ApiError ? err.status : 0,
          'AUTO_LOGIN_FAILED',
        )
        ;(tagged as unknown as { cause?: unknown }).cause = err
        throw tagged
      }
    },
    [login],
  )

  const logout = useCallback<AuthApi['logout']>(() => {
    clearSession()
    setState({ status: 'anonymous', user: null })
  }, [])

  const refreshApiKey = useCallback<AuthApi['refreshApiKey']>(async () => {
    const session = getSession()
    if (!session?.accessToken) {
      throw new ApiError(401, 'No access token to refresh API key against')
    }
    const key = await createApiKey(session.accessToken)
    setSession({ ...session, apiKey: key })
  }, [])

  const applyProfilePatch = useCallback<AuthApi['applyProfilePatch']>((patch) => {
    const session = getSession()
    if (!session) {
      throw new Error('applyProfilePatch called while anonymous')
    }
    const nextSession: Session = {
      ...session,
      avatar: patch.avatar ?? session.avatar,
      banner: patch.banner ?? session.banner,
      venueManager: patch.venueManager ?? session.venueManager,
    }
    setSession(nextSession)
    setState((prev) => {
      if (prev.status !== 'authenticated') return prev
      return {
        status: 'authenticated',
        user: {
          ...prev.user,
          avatar: patch.avatar ?? prev.user.avatar,
          banner: patch.banner ?? prev.user.banner,
          venueManager: patch.venueManager ?? prev.user.venueManager,
        },
      }
    })
  }, [])

  const api = useMemo<AuthApi>(
    () => ({
      state,
      user: state.status === 'authenticated' ? state.user : null,
      login,
      register,
      logout,
      refreshApiKey,
      applyProfilePatch,
    }),
    [state, login, register, logout, refreshApiKey, applyProfilePatch],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

// useAuth is colocated with AuthProvider for discoverability — splitting them
// into a separate module helps no one. The file is otherwise component-only.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
