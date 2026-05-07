interface IdentityMastheadProps {
  name: string
  role: string
  indexLabel: string
}

export function IdentityMasthead({ name, role, indexLabel }: IdentityMastheadProps) {
  return (
    <header className="av-byline" aria-label="Your identity">
      <div className="av-byline__crown mono">
        <span className="av-byline__cell">
          <span className="av-byline__lbl">Rubric</span>
          <span className="av-byline__val">Contributor</span>
        </span>
        <span className="av-byline__cell">
          <span className="av-byline__lbl">Role</span>
          <span className="av-byline__val">{role}</span>
        </span>
        <span className="av-byline__cell">
          <span className="av-byline__lbl">Index</span>
          <span className="av-byline__val">{indexLabel}</span>
        </span>
      </div>
      <h1 className="av-byline__name">{name}</h1>
      <p className="av-byline__deck">
        <em>Your face in the atlas.</em> Paste a URL to a square image, or pick a ground and we&apos;ll stamp your initial.
      </p>
    </header>
  )
}
