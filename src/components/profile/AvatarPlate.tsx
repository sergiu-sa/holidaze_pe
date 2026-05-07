import { type ImageProbeState } from '../../hooks/useImageProbe'

interface AvatarPlateProps {
  url: string
  alt: string
  initial: string
  state: ImageProbeState
  dim: { w: number; h: number } | null
  source: string
}

const STATE_LABEL: Record<ImageProbeState, string> = {
  empty: 'Empty',
  invalid: 'Invalid URL',
  probing: 'Probing…',
  ready: 'Ready',
  broken: "Couldn't fetch",
}

export function AvatarPlate({ url, alt, initial, state, dim, source }: AvatarPlateProps) {
  const showImage = state === 'ready' && url
  const dimLabel = dim ? `${String(dim.w)} × ${String(dim.h)}` : '— × —'

  return (
    <div className="av-plate" data-state={state}>
      <span className="av-plate__mark av-plate__mark--tl" aria-hidden="true" />
      <span className="av-plate__mark av-plate__mark--tr" aria-hidden="true" />
      <span className="av-plate__mark av-plate__mark--bl" aria-hidden="true" />
      <span className="av-plate__mark av-plate__mark--br" aria-hidden="true" />

      <div className="av-plate__frame">
        {showImage ? (
          <img src={url} alt={alt} referrerPolicy="no-referrer" />
        ) : (
          <div className="av-plate__mono" aria-hidden="true">
            {initial}
          </div>
        )}
      </div>

      <p className="av-plate__sr" aria-live="polite">
        Avatar status: {STATE_LABEL[state]}
      </p>

      <dl className="av-plate__tag mono">
        <div>
          <dt>State</dt>
          <dd>{STATE_LABEL[state]}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{source}</dd>
        </div>
        <div>
          <dt>Dim.</dt>
          <dd>{dimLabel}</dd>
        </div>
      </dl>
    </div>
  )
}
