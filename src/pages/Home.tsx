import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Atlas as AtlasComposite } from '../components/atlas/Atlas'
import { HeroPlate } from '../components/browse/HeroPlate'
import { VenueCard } from '../components/browse/VenueCard'
import { VenueCardSkeleton } from '../components/browse/VenueCardSkeleton'
import { VenuePeekModal } from '../components/browse/VenuePeekModal'
import { useVenues } from '../hooks/useVenues'
import type { Venue } from '../types/venue'

const FEATURED_LIMIT = 6
const BENTO_CELLS = ['bento__cell--1', 'bento__cell--2', 'bento__cell--3', 'bento__cell--4', 'bento__cell--5', 'bento__cell--6']

const MARQUEE_FALLBACK = ['Begur', 'Bergen', 'Kyoto', 'Paris', 'Marrakech', 'Fanø']

const SVG_REG = (
  <>
    <line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" strokeWidth="0.5" />
    <line x1="0" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="0.5" />
  </>
)

export default function Home() {
  const navigate = useNavigate()
  const [peekVenue, setPeekVenue] = useState<Venue | null>(null)
  const [peekIndex, setPeekIndex] = useState<number | undefined>(undefined)

  const featured = useVenues({ page: 1, limit: 50, sort: 'rating', sortOrder: 'desc' })
  // Bigger sample so the stats bar has meaningful unique-city/country/continent counts.
  const atlas = useVenues({ page: 1, limit: 100 })

  const stats = useMemo(() => {
    const venues = atlas.data ?? []
    const cities = new Set(venues.map((v) => v.location.city).filter(Boolean))
    const countries = new Set(venues.map((v) => v.location.country).filter(Boolean))
    const continents = new Set(venues.map((v) => v.location.continent).filter(Boolean))
    return {
      venues: venues.length,
      cities: cities.size,
      countries: countries.size,
      continents: continents.size,
    }
  }, [atlas.data])

  const cities = useMemo(() => {
    const venues = atlas.data ?? []
    const list = Array.from(
      new Set(venues.map((v) => v.location.city?.trim()).filter((c): c is string => Boolean(c))),
    )
    return list.length > 0 ? list : MARQUEE_FALLBACK
  }, [atlas.data])

  // Only `destination` is wired to ?q=; dates + guests defer to slice 4.2 (calendar).
  const [destination, setDestination] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [guests, setGuests] = useState(2)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination.trim()) params.set('q', destination.trim())
    navigate(`/venues${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const featuredVenues = featured.data?.slice(0, FEATURED_LIMIT) ?? []

  return (
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__masthead" aria-hidden="true">
          <span>Holidaze Press</span>
          <span>N°04 · Spring 2026</span>
        </div>

        <svg className="hero__cover-reg hero__cover-reg--tl" width="20" height="20" aria-hidden="true">
          {SVG_REG}
        </svg>
        <svg className="hero__cover-reg hero__cover-reg--tr" width="20" height="20" aria-hidden="true">
          {SVG_REG}
        </svg>
        <svg className="hero__cover-reg hero__cover-reg--bl" width="20" height="20" aria-hidden="true">
          {SVG_REG}
        </svg>
        <svg className="hero__cover-reg hero__cover-reg--br" width="20" height="20" aria-hidden="true">
          {SVG_REG}
        </svg>

        <span className="hero__scroll-hint">Scroll</span>

        <div className="hero__lead">
          <p className="eyebrow">
            <span className="eyebrow__num">§ 01</span>
            <span className="eyebrow__label">The Opening</span>
          </p>
          <h1 id="hero-title" className="hero__title">
            Stay somewhere <em className="hero__emph">particular.</em>
          </h1>
        </div>

        <div className="hero__body">
          <p className="hero__lede">
            A small, curated atlas of places worth the detour. Booked direct. No commission
            theatre, no plastic plants, no photos taken with a fisheye lens to make the room
            look twice its size.
          </p>

          <HeroPlate tag="Cover · N°04" />
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
            <label className="search__field">
              <span className="visually-hidden">Destination</span>
              <input
                type="text"
                name="destination"
                placeholder="a quiet village"
                autoComplete="off"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                }}
              />
            </label>
            <span className="search__prose">from</span>
            <label className="search__field search__field--date">
              <span className="visually-hidden">Arrive</span>
              <input
                type="date"
                name="from"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                }}
              />
            </label>
            <span className="search__prose">to</span>
            <label className="search__field search__field--date">
              <span className="visually-hidden">Depart</span>
              <input
                type="date"
                name="to"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                }}
              />
            </label>
            <span className="search__prose">, for</span>
            <label className="search__field search__field--short">
              <span className="visually-hidden">Guests</span>
              <input
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
              <span>Inquire →</span>
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
            <dd className="stats__num">
              <em>{stats.venues || '—'}</em>
            </dd>
            <dt className="stats__label">Venues indexed</dt>
          </div>
          <div className="stats__cell">
            <dd className="stats__num">
              <em>{stats.cities || '—'}</em>
            </dd>
            <dt className="stats__label">Cities</dt>
          </div>
          <div className="stats__cell">
            <dd className="stats__num">
              <em>{stats.countries || '—'}</em>
            </dd>
            <dt className="stats__label">Countries</dt>
          </div>
          <div className="stats__cell">
            <dd className="stats__num">
              <em>{stats.continents || '—'}</em>
            </dd>
            <dt className="stats__label">Continents</dt>
          </div>
        </dl>

        <div className="bento" role="list" aria-busy={featured.isLoading} aria-label="Featured venues">
          {featured.isLoading
            ? BENTO_CELLS.map((cell, i) => <VenueCardSkeleton key={i} className={cell} />)
            : featuredVenues.map((venue, i) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  index={i + 1}
                  className={BENTO_CELLS[i] ?? ''}
                  onPeek={(v) => {
                    setPeekVenue(v)
                    setPeekIndex(i)
                  }}
                />
              ))}
        </div>
      </section>

      {/* §03 — embedded Atlas. Replaces the "Your Atlas" strip — the editorial
          plate doubles as a navigation surface (slice 4.3). */}
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
          <div className="ed-note__statement">
            <span className="ed-note__mark" aria-hidden="true">§</span>
            <h3 className="ed-note__title">
              Every listing is read,
              <br />
              not <em>scraped.</em>
            </h3>
            <p className="ed-note__body">
              Holidaze is a curated index. We decline venues that don&apos;t meet the standard —
              no placeholder photos, no fictional pricing, no commission theatre. What you book
              is what the host charges. Direct.
            </p>
            <span className="ed-note__tag">— Editor, Issue N°04</span>
          </div>
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

      <section className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...cities, ...cities].map((city, i) => (
            <span className="marquee__item" key={`${city}-${String(i)}`}>
              {city}
            </span>
          ))}
        </div>
      </section>

      <VenuePeekModal
        venue={peekVenue}
        index={peekIndex}
        onClose={() => {
          setPeekVenue(null)
          setPeekIndex(undefined)
        }}
      />
    </main>
  )
}
