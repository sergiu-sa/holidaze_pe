import { MONO_COLORS, type MonoColor } from '../../lib/prefs'

interface MonogramGroundProps {
  value: MonoColor
  onChange: (next: MonoColor) => void
  initial: string
}

const HEX: Record<MonoColor, string> = {
  ink: '#0F0E0B',
  cinnabar: '#B8371D',
  cobalt: '#1E3358',
  saffron: '#D4A130',
}

export function MonogramGround({ value, onChange, initial }: MonogramGroundProps) {
  return (
    <fieldset className="av-ground">
      <legend className="av-ground__title">
        <span className="av-ground__num mono">§ 01·α</span> The <em>ground</em>
      </legend>
      <p className="av-ground__hint">
        The colour behind your initial when there&apos;s no photo. Pick one — it follows
        you everywhere your face appears.
      </p>
      <div className="av-ground__swatches" role="radiogroup" aria-label="Monogram ground colour">
        {MONO_COLORS.map((color) => {
          const id = `mono-${color}`
          const name = color[0].toUpperCase() + color.slice(1)
          return (
            <span key={color} className="av-sw">
              <input
                id={id}
                type="radio"
                name="monoColor"
                value={color}
                checked={value === color}
                onChange={() => {
                  onChange(color)
                }}
              />
              <label htmlFor={id} className="av-sw__body">
                <span className="av-sw__dot" data-mono={color} aria-hidden="true">
                  <span className="av-sw__initial">{initial}</span>
                </span>
                <span className="av-sw__name">{name}</span>
                <span className="mono av-sw__hex">{HEX[color]}</span>
              </label>
            </span>
          )
        })}
      </div>
    </fieldset>
  )
}
