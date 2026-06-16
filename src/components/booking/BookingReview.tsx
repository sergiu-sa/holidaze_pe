import { type RefObject } from 'react'

import { nightsBetween } from '../../lib/dates'
import { formatPrice } from '../../lib/venue-format'

export interface BookingReviewProps {
  venue: { name: string; price: number }
  from: Date
  to: Date
  guests: number
  total: number
  headingRef: RefObject<HTMLHeadingElement>
}

export function BookingReview({ venue, from, to, guests, total, headingRef }: BookingReviewProps) {
  return (
    <div className="book__review" aria-labelledby="book-review-title">
      <h3
        ref={headingRef}
        id="book-review-title"
        className="sr-only"
        tabIndex={-1}
      >
        Review your booking
      </h3>
      <div className="book__review-row">
        <span>Venue</span>
        <strong>{venue.name}</strong>
      </div>
      <div className="book__review-row">
        <span>Dates</span>
        <strong>
          {from.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })}
          {' → '}
          {to.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </strong>
      </div>
      <div className="book__review-row">
        <span>Nights / guests</span>
        <strong>
          {nightsBetween(from, to)} ·{' '}
          {guests} {guests === 1 ? 'guest' : 'guests'}
        </strong>
      </div>
      <div className="book__review-row">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>
    </div>
  )
}
