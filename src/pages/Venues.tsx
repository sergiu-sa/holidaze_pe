import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import heroVenuesUrl from '../assets/hero/hero-venues.webp'
import { Pager } from '../components/browse/Pager'
import { VenueCard } from '../components/browse/VenueCard'
import { VenueCardSkeleton } from '../components/browse/VenueCardSkeleton'
import { VenuePeekModal } from '../components/browse/VenuePeekModal'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useVenues } from '../hooks/useVenues'
import { useVenueSearch } from '../hooks/useVenueSearch'
import type { Filters, SortValue } from '../lib/venues-grid-helpers'
import {
  filterVenues,
  formatShortDate,
  initFiltersFromParams,
  INITIAL_FILTERS,
  isSortValue,
  SORT_OPTIONS,
  trimToBentoCount,
  variantClassFor,
} from '../lib/venues-grid-helpers'
import type { Venue } from '../types/venue'

// isUsable strips ~70% of Noroff data in practice; 50 fetched leaves enough
// for the largest bento target (15) on most pages.
const API_PAGE_SIZE = 50

const PAGE_HERO_BG = `url('${heroVenuesUrl}')`

export default function Venues() {
  useDocumentTitle('Venues')
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const sortRaw = searchParams.get('sort')
  const sort: SortValue = isSortValue(sortRaw) ? sortRaw : 'newest'
  const pageParam = Number(searchParams.get('page') ?? '1')
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const dateFromParam = searchParams.get('from') ?? ''
  const dateToParam = searchParams.get('to') ?? ''
  const hasDateRange = Boolean(dateFromParam && dateToParam)

  // Filters are component state, they overlay on the current API page only.
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(() => initFiltersFromParams(searchParams))

  const [searchInput, setSearchInput] = useState(q)

  const [peekVenue, setPeekVenue] = useState<Venue | null>(null)
  const [peekIndex, setPeekIndex] = useState<number | undefined>(undefined)
  const peekTriggerRef = useRef<HTMLElement | null>(null)
  const filterToggleRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL `q` into the controlled input on back/forward + deep-link load.
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    if (!filtersOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setFiltersOpen(false)
        filterToggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [filtersOpen])

  const updateParam = (
    key: string,
    value: string | null,
    options?: { replace?: boolean },
  ) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === null || value === '') next.delete(key)
        else next.set(key, value)
        if (key === 'q' || key === 'sort') next.delete('page')
        return next
      },
      options?.replace ? { replace: true } : undefined,
    )
  }

  const usingSearch = Boolean(q.trim())
  const list = useVenues({
    page,
    limit: API_PAGE_SIZE,
    sort: sort === 'newest' ? 'created' : sort.startsWith('price') ? 'price' : sort.startsWith('rating') ? 'rating' : 'name',
    sortOrder: sort === 'price-asc' || sort === 'name-asc' ? 'asc' : 'desc',
    enabled: !usingSearch,
  })
  const search = useVenueSearch({ q, limit: API_PAGE_SIZE })

  const sourceVenues = usingSearch ? search.data : list.data
  const isLoading = usingSearch ? search.isLoading || search.isDebouncing : list.isLoading
  const error = usingSearch ? search.error : list.error
  const isFallback = !usingSearch && list.isFallback

  const filteredVenues = useMemo(() => {
    if (!sourceVenues) return null
    return trimToBentoCount(filterVenues(sourceVenues, filters))
  }, [sourceVenues, filters])

  const visible = filteredVenues ?? []
  const visibleCount = visible.length
  const totalCount = !usingSearch ? (list.meta?.totalCount ?? null) : (search.meta?.totalCount ?? null)
  const pageCount = !usingSearch ? (list.meta?.pageCount ?? 1) : 1

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? SORT_OPTIONS[0].label

  const showEmpty = !isLoading && !error && filteredVenues?.length === 0
  const showResults = !isLoading && !error && filteredVenues && filteredVenues.length > 0

  const toggleAmenity = (a: 'wifi' | 'parking' | 'breakfast' | 'pets') => {
    setFilters((prev) => {
      const next = new Set(prev.amenities)
      if (next.has(a)) next.delete(a)
      else next.add(a)
      return { ...prev, amenities: next }
    })
  }

  const resetAll = () => {
    setFilters(INITIAL_FILTERS)
    updateParam('q', null)
    updateParam('sort', null)
    updateParam('page', null)
    updateParam('from', null)
    updateParam('to', null)
    updateParam('guests', null)
    setSearchInput('')
  }

  return (
    <main id="main">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <span aria-current="page">Venues</span>
          </li>
        </ol>
      </nav>

      <section
        className="page-hero"
        aria-labelledby="v-title"
        style={{ ['--page-hero-bg' as never]: PAGE_HERO_BG }}
      >
        <p className="eyebrow page-hero__eyebrow">
          <span className="eyebrow__num">§ 02</span>
          <span className="eyebrow__label">The Atlas</span>
        </p>
        <h1 className="page-hero__title" id="v-title" data-route-anchor tabIndex={-1}>
          Every <em>place</em>
          <br />
          in the atlas.
        </h1>
        <p className="page-hero__lede">
          The full Holidaze collection. Filter by place, dates, guests, amenities. Booked
          direct, without the broker tax.
        </p>
      </section>

      <div className="v-controls" role="region" aria-label="Filter and sort">
        <label className="v-search">
          <span className="visually-hidden">Search venues</span>
          <input
            type="search"
            placeholder="Search places, cities, countries…"
            autoComplete="off"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              updateParam('q', e.target.value, { replace: true })
            }}
          />
        </label>
        <button
          ref={filterToggleRef}
          type="button"
          className="v-filter-toggle"
          aria-controls="v-filters"
          aria-expanded={filtersOpen}
          onClick={() => {
            setFiltersOpen((s) => !s)
          }}
        >
          Filters
        </button>
        <select
          className="v-sort"
          aria-label="Sort venues"
          value={sort}
          onChange={(e) => {
            updateParam('sort', e.target.value)
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {hasDateRange && (
        <div className="v-dates" role="region" aria-label="Selected dates">
          <span className="v-dates__label">Dates</span>
          <span className="v-dates__range">
            <time dateTime={dateFromParam}>{formatShortDate(dateFromParam)}</time>
            <span aria-hidden="true"> → </span>
            <time dateTime={dateToParam}>{formatShortDate(dateToParam)}</time>
          </span>
          <button
            type="button"
            className="v-dates__clear"
            aria-label="Clear selected dates"
            onClick={() => {
              updateParam('from', null)
              updateParam('to', null)
            }}
          >
            Clear
          </button>
        </div>
      )}

      <div className="v-filters" id="v-filters" hidden={!filtersOpen}>
        <fieldset className="v-filters__group">
          <legend>Price (max)</legend>
          <input
            type="range"
            min={50}
            max={1000}
            step={10}
            value={filters.maxPrice}
            onChange={(e) => {
              setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))
            }}
            aria-label="Maximum price"
          />
          <div className="v-price-labels">
            <span>€50</span>
            <span>€{filters.maxPrice}</span>
          </div>
        </fieldset>
        <fieldset className="v-filters__group">
          <legend>Guests (min)</legend>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={filters.minGuests}
            onChange={(e) => {
              setFilters((p) => ({ ...p, minGuests: Number(e.target.value) }))
            }}
            aria-label="Minimum guests"
          />
          <div className="v-price-labels">
            <span>1</span>
            <span>{filters.minGuests}</span>
          </div>
        </fieldset>
        <fieldset className="v-filters__group">
          <legend>Amenities</legend>
          <label>
            <input
              type="checkbox"
              checked={filters.amenities.has('wifi')}
              onChange={() => {
                toggleAmenity('wifi')
              }}
            />{' '}
            Wi-Fi
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.amenities.has('parking')}
              onChange={() => {
                toggleAmenity('parking')
              }}
            />{' '}
            Parking
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.amenities.has('breakfast')}
              onChange={() => {
                toggleAmenity('breakfast')
              }}
            />{' '}
            Breakfast
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.amenities.has('pets')}
              onChange={() => {
                toggleAmenity('pets')
              }}
            />{' '}
            Pets OK
          </label>
        </fieldset>
        <fieldset className="v-filters__group">
          <legend>Rating (min)</legend>
          {[
            { v: 0, label: 'Any' },
            { v: 3, label: '3+' },
            { v: 4, label: '4+' },
            { v: 4.5, label: '4.5+' },
          ].map((opt) => (
            <label key={opt.v}>
              <input
                type="radio"
                name="rating"
                value={opt.v}
                checked={filters.minRating === opt.v}
                onChange={() => {
                  setFilters((p) => ({ ...p, minRating: opt.v }))
                }}
              />{' '}
              {opt.label}
            </label>
          ))}
        </fieldset>
      </div>

      {isFallback && (
        <aside className="v-errstate" role="status" aria-live="polite">
          <span className="v-errstate__mark">§ offline</span>
          <p className="v-errstate__body">
            Showing curated sample — bookings won&apos;t persist.
          </p>
          <button
            type="button"
            className="v-errstate__retry"
            onClick={() => {
              list.refetch()
            }}
          >
            Retry →
          </button>
        </aside>
      )}

      <div className="venues-head">
        <span role="status" aria-live="polite" aria-atomic="true">
          {isLoading
            ? 'Loading…'
            : error
              ? 'Error loading atlas'
              : totalCount != null
                ? `${String(visibleCount)} of ${String(totalCount)} venue${totalCount === 1 ? '' : 's'}${usingSearch ? ` matching “${q}”` : ''}`
                : `${String(visibleCount)} venue${visibleCount === 1 ? '' : 's'}`}
        </span>
        <span>{sortLabel}</span>
      </div>

      <section className="venues-list" aria-labelledby="v-title">
        <h2 className="visually-hidden">All venues</h2>
        <section
          className="venues-grid"
          aria-busy={isLoading}
          aria-label="All venues"
        >
          {isLoading &&
            Array.from({ length: 10 }, (_, i) => (
              <VenueCardSkeleton key={i} className={variantClassFor(i)} />
            ))}
          {showResults &&
            visible.map((venue, i) => {
              const runningIndex = (page - 1) * API_PAGE_SIZE + i + 1
              return (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  // Running count across pages, not page-relative.
                  index={runningIndex}
                  className={variantClassFor(i)}
                  onPeek={(v) => {
                    // Capture the trigger so focus returns there on close.
                    peekTriggerRef.current =
                      document.activeElement instanceof HTMLElement
                        ? document.activeElement
                        : null
                    setPeekVenue(v)
                    // Pass 0-based index for the modal eyebrow.
                    setPeekIndex(runningIndex - 1)
                  }}
                />
              )
            })}
        </section>

        {showEmpty && (
          <div className="v-empty">
            <p className="v-empty__title">Nothing matches.</p>
            <p className="v-empty__body">Try a less specific search, or clear a filter.</p>
            <button type="button" className="v-empty__reset" onClick={resetAll}>
              Reset all
            </button>
          </div>
        )}

        {error && (
          <div className="v-empty" role="alert">
            <p className="v-empty__title">Couldn&apos;t reach the atlas.</p>
            <p className="v-empty__body">Try again, or come back in a moment.</p>
            <button
              type="button"
              className="v-empty__reset"
              onClick={() => {
                if (usingSearch) updateParam('q', q)
                else list.refetch()
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!usingSearch && !isFallback && showResults && pageCount > 1 && (
          <Pager
            currentPage={page}
            pageCount={pageCount}
            onPageChange={(next) => {
              updateParam('page', String(next))
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </section>

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
