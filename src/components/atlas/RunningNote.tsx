import type { Continent } from '../../lib/atlas/cityCoords'
import { runningNoteFor } from '../../lib/atlas/runningNoteCopy'

export interface RunningNoteProps {
  continent: Continent | 'All'
  /** Visible city count, shown in the running note's footer. */
  cityCount: number
}

export function RunningNote({ continent, cityCount }: RunningNoteProps) {
  const note = runningNoteFor(continent)
  return (
    <aside className="atp__note" aria-label="Editorial note">
      <p className="atp__note__head">
        <span className="atp__note__num">{note.num}</span>
        <span className="atp__note__rubric">{note.rubric}</span>
      </p>
      <p className="atp__note__body">{note.body}</p>
      <p className="atp__note__foot">
        <span className="atp__note__count">{String(cityCount)}</span> cities visible
      </p>
    </aside>
  )
}
