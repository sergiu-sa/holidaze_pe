import type { Owner } from '../../types/venue'
import { Icon } from '../ui/Icon'

interface HostStripProps {
  owner: Owner | undefined
}

export function HostStrip({ owner }: HostStripProps) {
  if (!owner) return null

  const initial = owner.name.trim().charAt(0).toUpperCase() || 'H'
  const hasAvatar = Boolean(owner.avatar.url)

  return (
    <section className="host-strip" aria-label="Your host">
      <div className="host-strip__avatar" aria-hidden={hasAvatar ? undefined : 'true'}>
        {hasAvatar ? (
          <img
            src={owner.avatar.url}
            alt={`${owner.name} avatar`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          initial
        )}
      </div>
      <div className="host-strip__body">
        <h3>
          Hosted by <em id="host-name">{owner.name}</em>
        </h3>
        <p>Replies in &lt; 12h · Holidaze host</p>
      </div>
      {owner.email ? (
        <a className="host-strip__cta" href={`mailto:${owner.email}`}>
          <Icon name="mail" size="xs" />
          <span>Message host</span>
        </a>
      ) : null}
    </section>
  )
}
