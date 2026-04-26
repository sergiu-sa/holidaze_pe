import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { SkipLink } from '../components/shell/SkipLink'

// NotFound — 404 page. Mounted as a sibling of the layout route so it opts out
// of <AppLayout>; SkipLink is re-rendered locally to preserve keyboard access.
export default function NotFound() {
  useEffect(() => {
    document.title = '404 — Holidaze'
    return () => {
      document.title = 'Holidaze'
    }
  }, [])

  return (
    <>
      <SkipLink />
      <main id="main" className="px-gutter py-shelf">
        <p className="font-mono text-step--2 uppercase tracking-runhead text-cinnabar mb-4">
          404
        </p>
        <h1 className="font-serif text-step-5 text-ink leading-none">
          Off the atlas.
        </h1>
        <p className="mt-4 font-sans text-step-0 text-ink-soft max-w-prose">
          The URL you followed doesn&apos;t lead anywhere we&apos;ve been.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="
              font-mono text-step--2 uppercase tracking-eyebrow
              text-cinnabar border-b border-cinnabar pb-px
              transition-colors duration-fast ease-out-quint
              hover:text-cinnabar-deep hover:border-cinnabar-deep
              focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-cinnabar focus-visible:outline-offset-[3px]
            "
          >
            Back to the home page
          </Link>
        </div>
      </main>
    </>
  )
}
