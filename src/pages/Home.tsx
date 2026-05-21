import '../styles/home-cover.css'

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Atlas as AtlasComposite } from '../components/atlas/Atlas'
import { HeroPlate } from '../components/browse/HeroPlate'
import { VenueCard } from '../components/browse/VenueCard'
import { VenueCardSkeleton } from '../components/browse/VenueCardSkeleton'
import { VenuePeekModal } from '../components/browse/VenuePeekModal'
import { Icon } from '../components/ui/Icon'
import { useAtlasCities } from '../hooks/useAtlasCities'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHomeCoverVisits } from '../hooks/useHomeCoverVisits'
import { useIntroSeen } from '../hooks/useIntroSeen'
import { useMarqueeDuration } from '../hooks/useMarqueeDuration'
import { useVenues } from '../hooks/useVenues'
import { uniqueCitiesByLongitude, uniqueCityOptions } from '../lib/atlas/sortByLongitude'
import { addDays, formatDay, parseToLocalDay } from '../lib/dates'
import { pickHeroCover } from '../lib/hero/covers'
import type { Venue } from '../types/venue'

const IntroCover = lazy(() => import('../components/intro/IntroCover'))

const FEATURED_LIMIT = 6
const BENTO_CELLS = ['bento__cell--1', 'bento__cell--2', 'bento__cell--3', 'bento__cell--4', 'bento__cell--5', 'bento__cell--6']

const MARQUEE_FALLBACK = ['Begur', 'Bergen', 'Kyoto', 'Paris', 'Marrakech', 'Fanø']

// Quadratic ease-in — backdrop holds at the start of scroll, accelerates out.
function easeCt(t: number): number {
  return t * t
}

const COVER_SCROLL_RANGE_VH = 0.75

export default function Home() {
  useDocumentTitle('Home')
  const { seen, markSeen } = useIntroSeen()
  const peekTriggerRef = useRef<HTMLElement | null>(null)
  function handleIntroDismissed() {
    markSeen()
    // Restore focus to the page heading once the cover unmounts so AT users
    // don't lose their place in the document.
    window.setTimeout(() => {
      const anchor = document.querySelector<HTMLElement>('[data-route-anchor]')
      anchor?.focus()
    }, 0)
  }
  const { shouldShow: showCover } = useHomeCoverVisits()
  const navigate = useNavigate()
  const heroRef = useRef<HTMLElement>(null)
  const marqueeTrackRef = useRef<HTMLDivElement>(null)
  const [peekVenue, setPeekVenue] = useState<Venue | null>(null)
  const [peekIndex, setPeekIndex] = useState<number | undefined>(undefined)

  // Act 2 backdrop, and the folio coords + place.
  const cover = useMemo(() => pickHeroCover(), [])

  useEffect(() => {
    if (!showCover) return
    const hero = heroRef.current
    if (!hero) return

    hero.style.setProperty('--cover-img', `url(${cover.src})`)
    hero.style.setProperty('--ct', '0')

    const range = window.innerHeight * COVER_SCROLL_RANGE_VH
    let done = false
    let ticking = false

    const settle = (): void => {
      done = true
      hero.style.setProperty('--ct', '1')
      hero.style.removeProperty('--cover-scale')
      hero.style.removeProperty('--cover-y')
      hero.dataset.coverDone = 'true'
      window.removeEventListener('scroll', onScroll)
    }

    const onScroll = (): void => {
      if (done || ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const t = Math.min(1, Math.max(0, window.scrollY / range))
        const ct = Math.min(1, easeCt(t))
        hero.style.setProperty('--ct', ct.toFixed(4))
        hero.style.setProperty('--cover-scale', (1 + t * 0.04).toFixed(4))
        hero.style.setProperty('--cover-y', `${(t * -8).toFixed(2)}px`)
        if (ct >= 1) settle()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      hero.style.removeProperty('--cover-img')
      hero.style.removeProperty('--ct')
      hero.style.removeProperty('--cover-scale')
      hero.style.removeProperty('--cover-y')
      delete hero.dataset.coverDone
    }
  }, [showCover, cover.src])

  const featured = useVenues({ page: 1, limit: 50, sort: 'rating', sortOrder: 'desc' })
  // useAtlasCities applies the curated gazetteer to fill missing
  // country/continent values that the raw Noroff data often omits.
  const atlas = useAtlasCities()

  const cityOptions = useMemo(() => uniqueCityOptions(atlas.cities), [atlas.cities])

  const stats = useMemo(() => {
    const countries = new Set(atlas.cities.map((c) => c.country).filter(Boolean))
    const continents = new Set(atlas.cities.map((c) => c.continent).filter(Boolean))
    return {
      venues: atlas.totalVenues,
      cities: cityOptions.length,
      countries: countries.size,
      continents: continents.size,
    }
  }, [atlas.cities, atlas.totalVenues, cityOptions])

  // Marquee reads west-to-east as a journey, not an alphabetised inventory —
  // datalist stays alphabetical because picking wants stable order.
  const marqueeCities = useMemo(() => {
    const list = uniqueCitiesByLongitude(atlas.cities)
    return list.length > 0 ? list : MARQUEE_FALLBACK
  }, [atlas.cities])

  useMarqueeDuration(marqueeTrackRef, 140)

  const [destination, setDestination] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [guests, setGuests] = useState(2)

  const todayISO = useMemo(() => formatDay(new Date()), [])
  const minDepart = useMemo(() => {
    if (!dateFrom) return todayISO
    return formatDay(addDays(parseToLocalDay(dateFrom), 1))
  }, [dateFrom, todayISO])

  const handleArriveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setDateFrom(next)
    if (dateTo && next && dateTo <= next) setDateTo('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination.trim()) params.set('q', destination.trim())
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    if (guests && guests !== 2) params.set('guests', String(guests))
    const qs = params.toString()
    navigate(`/venues${qs ? `?${qs}` : ''}`)
  }

  const featuredVenues = featured.data?.slice(0, FEATURED_LIMIT) ?? []

  return (
    <main id="main">
      {!seen && (
        <Suspense fallback={null}>
          <IntroCover onDismissed={handleIntroDismissed} />
        </Suspense>
      )}
      <section
        ref={heroRef}
        className={`hero${showCover ? ' hero--cover' : ''}`}
        aria-labelledby="hero-title"
      >
        {showCover && (
          <>
            <div className="hero__cover-rule" aria-hidden="true" />
            <aside className="hero__cover-folio" aria-hidden="true">
              <span className="hero__cover-folio-section">§ 01 · Spring 2026</span>
              <span className="hero__cover-folio-mark">
                <span className="hero__cover-folio-pin" aria-hidden="true">
                  <svg className="hero__cover-folio-pin-mark" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <svg className="hero__cover-folio-pin-pulse" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </span>
                {cover.coords}
              </span>
              <span className="hero__cover-folio-place">{cover.place}</span>
            </aside>
          </>
        )}

        <div className="hero__lead">
          <p className="eyebrow">
            <span className="eyebrow__num">§ 01</span>
            <span className="eyebrow__label">The Opening</span>
          </p>
          <h1 id="hero-title" className="hero__title" data-route-anchor tabIndex={-1}>
            Stay somewhere <em className="hero__emph">particular.</em>
          </h1>
        </div>

        <div className="hero__body">
          <p className="hero__lede">
            A small, curated atlas of places worth the detour. Booked direct. No commission
            theatre, no plastic plants, no photos taken with a fisheye lens to make the room
            look twice its size.
          </p>

          <HeroPlate cover={cover} tag="Cover · N°04" />
        </div>

        <div className="search-wrap">
          <div className="search-wrap__head">
            <span className="search-wrap__label">Find a stay</span>
            <span className="search-wrap__step" aria-live="polite">
              — places in the atlas
            </span>
          </div>
          <form className="search" role="search" aria-label="Find a venue" onSubmit={handleSubmit}>
            <span className="search__prose">I&apos;m looking to stay in</span>
            <label className="search__field" htmlFor="search-destination">
              <span className="search__pictogram" aria-hidden="true">
                <Icon name="pin" size="sm" />
              </span>
              <span className="visually-hidden">Destination</span>
              <input
                id="search-destination"
                type="text"
                name="destination"
                list="search-cities"
                placeholder="a quiet village"
                autoComplete="off"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                }}
              />
            </label>
            <datalist id="search-cities">
              {cityOptions.map(({ city, country }) => (
                <option key={city} value={city}>
                  {country ? `${city}, ${country}` : city}
                </option>
              ))}
            </datalist>
            <span className="search__prose">from</span>
            <label className="search__field search__field--date" htmlFor="search-from">
              <span className="search__pictogram" aria-hidden="true">
                <Icon name="calendar" size="sm" />
              </span>
              <span className="visually-hidden">Arrive</span>
              <input
                id="search-from"
                type="date"
                name="from"
                min={todayISO}
                value={dateFrom}
                onChange={handleArriveChange}
              />
            </label>
            <span className="search__prose">to</span>
            <label className="search__field search__field--date" htmlFor="search-to">
              <span className="search__pictogram" aria-hidden="true">
                <Icon name="calendar" size="sm" />
              </span>
              <span className="visually-hidden">Depart</span>
              <input
                id="search-to"
                type="date"
                name="to"
                min={minDepart}
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                }}
              />
            </label>
            <span className="search__prose">, for</span>
            <label className="search__field search__field--short" htmlFor="search-guests">
              <span className="search__pictogram" aria-hidden="true">
                <Icon name="guests" size="sm" />
              </span>
              <span className="visually-hidden">Guests</span>
              <input
                id="search-guests"
                type="number"
                name="guests"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => {
                  setGuests(Number(e.target.value))
                }}
              />
            </label>
            <span className="search__prose">guests.</span>
            <button type="submit" className="search__submit">
              <Icon name="search" size="sm" />
              <span>Inquire</span>
              <Icon name="arrow-right" size="sm" />
            </button>
          </form>
        </div>
      </section>

      <section className="section" id="featured" aria-labelledby="featured-title">
        <div className="section__head">
          <p className="eyebrow">
            <span className="eyebrow__num">§ 02</span>
            <span className="eyebrow__label">Featured</span>
          </p>
          <h2 className="section__title" id="featured-title">
            The <em>current</em> collection.
          </h2>
          <p className="section__meta mono" aria-live="polite">
            {featured.isLoading
              ? 'Loading atlas…'
              : featured.isFallback
                ? 'Showing curated selection'
                : `${String(stats.venues || featuredVenues.length)} venues indexed`}
          </p>
        </div>

        <dl className="stats" aria-label="Atlas statistics">
          <div className="stats__cell">
            <dt className="stats__label">Venues indexed</dt>
            <dd className="stats__num">
              <em>{stats.venues || '—'}</em>
            </dd>
          </div>
          <div className="stats__cell">
            <dt className="stats__label">Cities</dt>
            <dd className="stats__num">
              <em>{stats.cities || '—'}</em>
            </dd>
          </div>
          <div className="stats__cell">
            <dt className="stats__label">Countries</dt>
            <dd className="stats__num">
              <em>{stats.countries || '—'}</em>
            </dd>
          </div>
          <div className="stats__cell">
            <dt className="stats__label">Continents</dt>
            <dd className="stats__num">
              <em>{stats.continents || '—'}</em>
            </dd>
          </div>
        </dl>

        <section className="bento" aria-busy={featured.isLoading} aria-labelledby="bento-title">
          <h2 id="bento-title" className="visually-hidden">Featured venues</h2>
          {featured.isLoading
            ? BENTO_CELLS.map((cell, i) => <VenueCardSkeleton key={i} className={cell} />)
            : featuredVenues.map((venue, i) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  index={i + 1}
                  className={BENTO_CELLS[i] ?? ''}
                  onPeek={(v) => {
                    // Capture the card link so focus returns there on close.
                    peekTriggerRef.current =
                      document.activeElement instanceof HTMLElement ? document.activeElement : null
                    setPeekVenue(v)
                    setPeekIndex(i)
                  }}
                />
              ))}
        </section>
      </section>

      {/* §03 — embedded Atlas. The editorial plate doubles as a navigation surface. */}
      <AtlasComposite variant="compact" />

      <section className="section" aria-labelledby="ednote-title">
        <div className="section__head">
          <p className="eyebrow">
            <span className="eyebrow__num">§ 04</span>
            <span className="eyebrow__label">Editor&apos;s Note</span>
          </p>
          <h2 className="section__title" id="ednote-title">
            How this <em>atlas</em> works.
          </h2>
        </div>
        <div className="ed-note">
          <div className="ed-note__specs">
            <div className="section-mark">
              <span className="section-mark__num">§</span> Specs
            </div>
            <div className="ed-note__pair">
              <span className="ed-note__key">Commission</span>
              <span className="ed-note__dots" />
              <span className="ed-note__val ed-note__val--accent">0%</span>
            </div>
            <div className="ed-note__pair">
              <span className="ed-note__key">Booking</span>
              <span className="ed-note__dots" />
              <span className="ed-note__val">Direct to host</span>
            </div>
            <div className="ed-note__pair">
              <span className="ed-note__key">Host reply</span>
              <span className="ed-note__dots" />
              <span className="ed-note__val">&lt; 12 hours</span>
            </div>
            <div className="ed-note__pair">
              <span className="ed-note__key">Curation</span>
              <span className="ed-note__dots" />
              <span className="ed-note__val">Manual review</span>
            </div>
            <div className="ed-note__pair">
              <span className="ed-note__key">Since</span>
              <span className="ed-note__dots" />
              <span className="ed-note__val">2024</span>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track" ref={marqueeTrackRef}>
          {[...marqueeCities, ...marqueeCities].map((city, i) => (
            <span className="marquee__item" key={`${city}-${String(i)}`}>
              {city}
            </span>
          ))}
        </div>
      </div>

      <VenuePeekModal
        venue={peekVenue}
        index={peekIndex}
        onClose={() => {
          setPeekVenue(null)
          setPeekIndex(undefined)
          peekTriggerRef.current?.focus()
        }}
      />
    </main>
  )
}
