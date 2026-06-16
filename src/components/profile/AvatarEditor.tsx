import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { useImageProbe } from '../../hooks/useImageProbe'
import { useUpdateProfile } from '../../hooks/useUpdateProfile'
import { toFriendlyMessage } from '../../lib/error-message'
import { isMonogramUrl, monoColorFromUrl, monogramAvatarUrl } from '../../lib/monogram'
import { applyMonoColorToBody, getMonoColor, type MonoColor, setMonoColor } from '../../lib/prefs'
import { useConfirm } from '../ui/ConfirmDialog'
import { useToast } from '../ui/ToastProvider'
import { AvatarContexts } from './AvatarContexts'
import { AvatarPlate } from './AvatarPlate'
import { IdentityMasthead } from './IdentityMasthead'
import { MonogramGround } from './MonogramGround'

function emailHashIndex(email: string): string {
  let h = 0
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0
  return `N°${String(Math.abs(h) % 1000).padStart(3, '0')}`
}

function sourceFor(url: string): string {
  if (!url) return '—'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Custom URL'
  }
}

export function AvatarEditor() {
  const { user } = useAuth()
  const update = useUpdateProfile()
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()

  const [url, setUrl] = useState(user?.avatar?.url ?? '')
  const [alt, setAlt] = useState(user?.avatar?.alt ?? '')
  const [mono, setMono] = useState<MonoColor>(
    () => monoColorFromUrl(user?.avatar?.url ?? '') ?? getMonoColor(),
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const probe = useImageProbe(url)
  const initial = (user?.name.charAt(0) ?? '?').toUpperCase()

  useEffect(() => {
    applyMonoColorToBody(mono)
  }, [mono])

  function onMonoChange(next: MonoColor) {
    setMono(next)
    setMonoColor(next)
    // Regenerate when the URL is itself a monogram so the colour pick
    // propagates to the live preview and the eventual save.
    if (isMonogramUrl(url)) {
      setUrl(monogramAvatarUrl(initial, next))
    }
  }

  async function onReset() {
    if (!url) return
    const ok = await confirm({
      rubric: 'Remove avatar',
      title: 'Remove your avatar?',
      body: "We'll fall back to a monogram stamp of your initial until you add one again.",
      confirmText: 'Remove it',
      cancelText: 'Keep it',
      danger: true,
    })
    if (!ok) return
    setUrl('')
    setAlt('')
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    const trimmed = url.trim()
    const trimmedAlt = alt.trim()
    const altOrName = trimmedAlt.length > 0 ? trimmedAlt : (user?.name ?? '')
    try {
      // Blank URL or an existing monogram both fall through to a fresh
      // monogram render so a colour swap after save is honoured.
      const avatar = trimmed && !isMonogramUrl(trimmed)
        ? { url: trimmed, alt: altOrName }
        : {
            url: monogramAvatarUrl(initial, mono),
            alt: `${user?.name ?? 'User'} monogram`,
          }
      await update.submit({ avatar })
      toast('Saved.', { kind: 'success' })
      navigate('/profile')
    } catch (err) {
      setSubmitError(
        toFriendlyMessage(err, "Sorry, we couldn't update your avatar. Please try again."),
      )
    }
  }

  if (!user) return null

  const role = user.venueManager ? 'Host' : 'Guest'

  return (
    <>
      <IdentityMasthead
        name={user.name}
        role={role}
        indexLabel={emailHashIndex(user.email)}
      />

      <form className="av-form" onSubmit={(e) => { void onSubmit(e) }} noValidate>
        <section className="av-sec" aria-labelledby="av-sec-01">
          <header className="av-sec__head">
            <p className="av-sec__num mono">§ 01</p>
            <h2 id="av-sec-01" className="av-sec__title">
              The <em>face</em>.
            </h2>
            <p className="av-sec__deck">
              A square image reads best — it gets cropped depending on where it appears.
            </p>
          </header>

          <AvatarPlate
            url={url}
            alt={alt || user.name}
            initial={initial}
            state={probe.state}
            dim={probe.dim}
            source={sourceFor(url)}
          />

          <MonogramGround value={mono} onChange={onMonoChange} initial={initial} />
        </section>

        <section className="av-sec" aria-labelledby="av-sec-02">
          <header className="av-sec__head">
            <p className="av-sec__num mono">§ 02</p>
            <h2 id="av-sec-02" className="av-sec__title">
              The <em>details</em>.
            </h2>
          </header>

          <div className="av-fields">
            <label className="av-spec" data-n="01">
              <span className="av-spec__label">Display name</span>
              <input
                className="av-spec__input"
                type="text"
                value={user.name}
                readOnly
                autoComplete="off"
                aria-describedby="av-display-hint"
              />
              <span id="av-display-hint" className="av-spec__hint">
                Set when you registered — can&apos;t be changed.
              </span>
            </label>

            <label className="av-spec" data-n="02">
              <span className="av-spec__label">Avatar URL</span>
              <input
                className="av-spec__input"
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://…"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                }}
                aria-describedby="av-url-hint"
                aria-invalid={probe.state === 'invalid' || probe.state === 'broken'}
              />
              <span className="av-spec__hint" id="av-url-hint">
                {probe.state === 'invalid'
                  ? 'URL must start with http:// or https://'
                  : probe.state === 'broken'
                    ? "Image failed to load. Try another URL."
                    : 'Paste a link to any square image. Leave blank to use your initial + ground colour.'}
              </span>
            </label>

            <label className="av-spec" data-n="03">
              <span className="av-spec__label">
                Alt text <span className="av-spec__opt mono">opt.</span>
              </span>
              <input
                className="av-spec__input"
                type="text"
                placeholder="e.g. Portrait of Elena at dusk."
                value={alt}
                onChange={(e) => {
                  setAlt(e.target.value)
                }}
              />
              <span className="av-spec__hint">
                For screen readers. Defaults to your display name.
              </span>
            </label>
          </div>
        </section>

        <section className="av-sec" aria-labelledby="av-sec-03">
          <header className="av-sec__head">
            <p className="av-sec__num mono">§ 03</p>
            <h2 id="av-sec-03" className="av-sec__title">
              Where you&apos;ll <em>appear</em>.
            </h2>
          </header>
          <AvatarContexts
            url={probe.state === 'ready' ? url : ''}
            alt={alt || user.name}
            initial={initial}
            name={user.name}
          />
        </section>

        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}

        <div className="av-actions">
          <div className="av-actions__set">
            <button type="submit" className="auth__submit" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save →'}
            </button>
            <Link to="/profile" className="rec__btn">
              Cancel
            </Link>
          </div>
          <button
            type="button"
            className="av-actions__reset mono"
            onClick={() => { void onReset() }}
            disabled={!url}
          >
            <span aria-hidden="true">×</span> Remove avatar
          </button>
        </div>
      </form>
    </>
  )
}
