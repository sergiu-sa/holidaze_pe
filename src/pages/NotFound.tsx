import { useEffect } from 'react'

import { NotFoundCard } from '../components/shell/NotFoundCard'
import { SkipLink } from '../components/shell/SkipLink'

// NotFound — route-level 404. Mounted as a sibling of the layout route so it
// opts out of <AppLayout>; SkipLink is re-rendered locally to preserve keyboard access.
export default function NotFound() {
  useEffect(() => {
    document.title = 'Off the atlas · Holidaze'
    return () => {
      document.title = 'Holidaze'
    }
  }, [])

  return (
    <>
      <SkipLink />
      <main id="main">
        <NotFoundCard
          title={
            <>
              This page is <em>off the atlas.</em>
            </>
          }
          body="The URL you followed doesn't lead anywhere we've been."
          links={[
            { to: '/', label: 'Back to the home page', primary: true },
            { to: '/venues', label: 'Browse venues instead' },
          ]}
        />
      </main>
    </>
  )
}
