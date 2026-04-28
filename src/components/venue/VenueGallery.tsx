import { useRef, useState } from 'react'

import type { Media } from '../../types/venue'
import { Icon } from '../ui/Icon'
import { Mono } from '../ui/Mono'

// Hero image + thumbnail rail + lightbox. Empty media renders an ink placeholder;
// a single image hides the rail and arrows.

interface VenueGalleryProps {
  media: Media[]
  venueName: string
  /** Optional eyebrow label shown in the top-right rail. */
  indexLabel?: string
  /** Optional coords shown in the bottom rail. */
  coords?: string
}

const pad2 = (n: number) => String(n + 1).padStart(2, '0')

// Collapse near-duplicate CDN URLs (different query strings, trailing slashes).
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    return (u.origin + u.pathname).toLowerCase().replace(/\/+$/, '')
  } catch {
    return url.trim().toLowerCase()
  }
}

function dedupe(media: Media[]): Media[] {
  const seen = new Set<string>()
  const out: Media[] = []
  for (const item of media) {
    if (!item.url) continue
    const key = normalizeUrl(item.url)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export function VenueGallery({ media, venueName, indexLabel, coords }: VenueGalleryProps) {
  const list = dedupe(media)
  const [idx, setIdx] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const safeIdx = Math.min(idx, Math.max(0, list.length - 1))
  const active = list[safeIdx]
  const captionOf = (i: number) => {
    const alt = list[i].alt.trim()
    return alt !== '' ? alt : `${venueName} — photograph ${pad2(i)}`
  }

  function go(delta: number) {
    if (list.length <= 1) return
    setIdx((current) => (current + delta + list.length) % list.length)
  }

  function openLightbox() {
    dialogRef.current?.showModal()
  }
  function closeLightbox() {
    dialogRef.current?.close()
  }

  if (list.length === 0) {
    return (
      <section className="v-hero" aria-label="Venue photograph">
        <div className="v-hero__rail v-hero__rail--top" aria-hidden="true">
          <span className="v-hero__cell">§ 06 · FEATURE</span>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="v-hero" aria-label="Venue photograph">
        <button
          type="button"
          onClick={openLightbox}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              go(-1)
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              go(1)
            }
          }}
          className="absolute inset-0 cursor-zoom-in p-0 border-0 bg-transparent"
          aria-label={`Open ${venueName} photograph in lightbox`}
        >
          <img
            key={active.url}
            src={active.url}
            alt={captionOf(safeIdx)}
            referrerPolicy="no-referrer"
            loading="eager"
            fetchPriority="high"
          />
        </button>

        <div className="v-hero__rail v-hero__rail--top" aria-hidden="true">
          <span className="v-hero__cell">§ 06 · FEATURE</span>
          {indexLabel ? (
            <span className="v-hero__cell v-hero__cell--right">{indexLabel}</span>
          ) : null}
        </div>
        <div className="v-hero__rail v-hero__rail--bottom" aria-hidden="true">
          {coords ? <Mono className="v-hero__cell">{coords}</Mono> : <span />}
          {list.length > 1 ? (
            <Mono className="v-mag__counter">
              <em>{pad2(safeIdx)}</em> / {pad2(list.length - 1)}
            </Mono>
          ) : null}
        </div>

        {list.length > 1 ? (
          <>
            <button
              type="button"
              className="v-gal__arrow v-gal__arrow--prev"
              onClick={(e) => {
                e.stopPropagation()
                go(-1)
              }}
              aria-label="Previous photograph"
            >
              <Icon name="arrow-left" size="sm" />
            </button>
            <button
              type="button"
              className="v-gal__arrow v-gal__arrow--next"
              onClick={(e) => {
                e.stopPropagation()
                go(1)
              }}
              aria-label="Next photograph"
            >
              <Icon name="arrow-right" size="sm" />
            </button>
          </>
        ) : null}

        <p className="sr-only" role="status" aria-live="polite">
          Photograph {safeIdx + 1} of {list.length}
        </p>
      </section>

      {list.length > 1 ? (
        <ol className="v-gal__strip" role="tablist" aria-label="Photograph thumbnails">
          {list.map((m, i) => (
            <li key={m.url} className="v-gal__thumb-wrap">
              <button
                type="button"
                className={`v-gal__thumb${i === safeIdx ? ' is-active' : ''}`}
                role="tab"
                aria-selected={i === safeIdx}
                aria-label={`Show photograph ${pad2(i)} of ${pad2(list.length - 1)}`}
                tabIndex={i === safeIdx ? 0 : -1}
                onClick={() => { setIdx(i); }}
              >
                <img src={m.url} alt="" referrerPolicy="no-referrer" loading="lazy" />
                <span className="v-gal__thumb-num">{pad2(i)}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- <dialog> is interactive; the rule doesn't recognise it. */}
      <dialog
        ref={dialogRef}
        className="v-lightbox"
        aria-labelledby="v-lightbox-cap"
        onClick={(event) => {
          // A click on the dialog itself (the backdrop) closes the lightbox.
          if (event.target === dialogRef.current) closeLightbox()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            go(-1)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            go(1)
          }
        }}
      >
        <button
          type="button"
          className="v-lightbox__close"
          onClick={closeLightbox}
          aria-label="Close gallery"
        >
          <span>Close</span>
          <Icon name="close" size="xs" />
        </button>
        <figure className="v-lightbox__fig">
          <img src={active.url} alt={captionOf(safeIdx)} referrerPolicy="no-referrer" />
          <figcaption className="v-lightbox__cap mono" id="v-lightbox-cap">
            {captionOf(safeIdx)} · {pad2(safeIdx)} / {pad2(list.length - 1)}
          </figcaption>
        </figure>
        {list.length > 1 ? (
          <>
            <button
              type="button"
              className="v-lightbox__arrow v-lightbox__arrow--prev"
              onClick={() => { go(-1); }}
              aria-label="Previous photograph"
            >
              <Icon name="arrow-left" size="md" />
            </button>
            <button
              type="button"
              className="v-lightbox__arrow v-lightbox__arrow--next"
              onClick={() => { go(1); }}
              aria-label="Next photograph"
            >
              <Icon name="arrow-right" size="md" />
            </button>
          </>
        ) : null}
      </dialog>
    </>
  )
}
