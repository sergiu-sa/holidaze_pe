import { Icon } from '../ui/Icon'

export interface BookingGuestStepperProps {
  guests: number
  maxGuests: number
  onGuestsChange: (n: number) => void
}

function clampGuests(n: number, maxGuests: number): number {
  return Math.max(1, Math.min(maxGuests, n))
}

export function BookingGuestStepper({ guests, maxGuests, onGuestsChange }: BookingGuestStepperProps) {
  return (
    <div className="book__guests" role="group" aria-labelledby="book-guests-lbl">
      <span id="book-guests-lbl">Guests</span>
      <div className="stepper">
        <button
          type="button"
          className="stepper__btn"
          onClick={() => {
            onGuestsChange(clampGuests(guests - 1, maxGuests))
          }}
          disabled={guests <= 1}
          aria-label="Decrease guests"
        >
          <Icon name="minus" size="xs" />
        </button>
        <input
          type="number"
          name="guests"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => {
            onGuestsChange(clampGuests(Number(e.target.value) || 1, maxGuests))
          }}
          aria-labelledby="book-guests-lbl"
          aria-describedby="book-guests-max"
        />
        <button
          type="button"
          className="stepper__btn"
          onClick={() => {
            onGuestsChange(clampGuests(guests + 1, maxGuests))
          }}
          disabled={guests >= maxGuests}
          aria-label="Increase guests"
        >
          <Icon name="plus" size="xs" />
        </button>
      </div>
      <span className="book__guests-max" id="book-guests-max">
        max {maxGuests}
      </span>
    </div>
  )
}
