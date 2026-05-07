interface AvatarContextsProps {
  url: string
  alt: string
  initial: string
  name: string
}

export function AvatarContexts({ url, alt, initial, name }: AvatarContextsProps) {
  function avatarNode() {
    return url ? (
      <img src={url} alt={alt} referrerPolicy="no-referrer" />
    ) : (
      <span>{initial}</span>
    )
  }

  return (
    <div className="av-contexts">
      <figure className="av-ctx">
        <figcaption className="av-ctx__cap">
          <span className="mono">Ctx·01</span>
          <span>Account chip, topbar</span>
        </figcaption>
        <div className="av-ctx__stage av-ctx__stage--chip">
          <div className="av-ctx-chip">
            <span className="av-ctx-chip__av">{avatarNode()}</span>
            <span className="av-ctx-chip__name">{name || 'You'}</span>
            <span className="av-ctx-chip__chev" aria-hidden="true">▾</span>
          </div>
        </div>
      </figure>

      <figure className="av-ctx">
        <figcaption className="av-ctx__cap">
          <span className="mono">Ctx·02</span>
          <span>Host strip, venue page</span>
        </figcaption>
        <div className="av-ctx__stage">
          <div className="av-ctx-host">
            <div className="av-ctx-host__av">{avatarNode()}</div>
            <div className="av-ctx-host__body">
              <h4>
                Hosted by <em>{name || 'the host'}</em>
              </h4>
              <p className="mono">Replies in &lt; 12h</p>
            </div>
          </div>
        </div>
      </figure>

      <figure className="av-ctx">
        <figcaption className="av-ctx__cap">
          <span className="mono">Ctx·03</span>
          <span>Booking receipt stamp</span>
        </figcaption>
        <div className="av-ctx__stage av-ctx__stage--stamp">
          <div className="av-ctx-stamp">
            <div className="av-ctx-stamp__av">{avatarNode()}</div>
            <div className="av-ctx-stamp__meta">
              <p className="mono">Booked by</p>
              <p className="av-ctx-stamp__name">{name || '—'}</p>
            </div>
          </div>
        </div>
      </figure>
    </div>
  )
}
