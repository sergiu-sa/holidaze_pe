import '../styles/hosts.css'

import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import {
  BookingAnatomy,
  Correspondence,
  HelpRail,
  HostPlates,
  HostsHero,
  SignedOff,
  StrikeMoves,
} from '../components/hosts'

export default function Hosts() {
  useEffect(() => {
    document.title = 'Holidaze — On Hosting · A Specimen'
    return () => {
      document.title = 'Holidaze'
    }
  }, [])

  useEffect(() => {
    let mounted = true
    // Cast to unknown: document.fonts is absent in JSDOM / very old browsers
    // despite the DOM lib typing it as always-present.
    const fonts = document.fonts as unknown as FontFaceSet | undefined
    if (!fonts?.load) {
      document.documentElement.classList.add('fonts-ready')
      return
    }
    void fonts.load('700 6rem Caveat').finally(() => {
      if (mounted) document.documentElement.classList.add('fonts-ready')
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (window.location.hash !== '#contact') return
    const target = document.getElementById('contact')
    if (!target) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
  }, [])

  return (
    <main id="main">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <span aria-current="page">Hosts</span>
          </li>
        </ol>
      </nav>

      <HelpRail />

      <div className="page-wrap">
        <HostsHero />
        <HostPlates />
        <BookingAnatomy />
        <StrikeMoves />
        <Correspondence />
        <SignedOff />
      </div>
    </main>
  )
}
