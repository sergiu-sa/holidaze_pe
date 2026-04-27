import { Icon } from '../ui/Icon'

export interface PagerProps {
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

const WINDOW = 1

function buildPageList(currentPage: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, pageCount, currentPage])
  for (let offset = 1; offset <= WINDOW; offset++) {
    if (currentPage - offset > 1) pages.add(currentPage - offset)
    if (currentPage + offset < pageCount) pages.add(currentPage + offset)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]
    result.push(n)
    if (i + 1 < sorted.length && sorted[i + 1] - n > 1) result.push('gap')
  }
  return result
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function Pager({ currentPage, pageCount, onPageChange, className }: PagerProps) {
  if (pageCount <= 1) return null

  const composed = ['pager', className].filter(Boolean).join(' ')
  const pages = buildPageList(currentPage, pageCount)
  const atFirst = currentPage <= 1
  const atLast = currentPage >= pageCount

  return (
    <nav className={composed} aria-label="Pagination">
      <button
        type="button"
        className="pager__btn pager__btn--nav"
        disabled={atFirst}
        onClick={() => {
          onPageChange(currentPage - 1)
        }}
      >
        <Icon name="chevron-left" size="sm" /> <span>Prev</span>
      </button>

      <ol className="pager__list">
        {pages.map((entry, i) =>
          entry === 'gap' ? (
            <li key={`gap-${String(i)}`} className="pager__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                className={`pager__num${entry === currentPage ? ' is-active' : ''}`}
                aria-current={entry === currentPage ? 'page' : undefined}
                aria-label={`Go to page ${String(entry)}`}
                onClick={() => {
                  if (entry !== currentPage) onPageChange(entry)
                }}
              >
                {pad(entry)}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        className="pager__btn pager__btn--nav"
        disabled={atLast}
        onClick={() => {
          onPageChange(currentPage + 1)
        }}
      >
        <span>Next</span> <Icon name="chevron-right" size="sm" />
      </button>

      <span className="pager__meta">
        Page {currentPage} / {pageCount}
      </span>
    </nav>
  )
}
