export interface VenueCardSkeletonProps {
  /** Variant class to match the slot the live card would occupy. */
  className?: string
}

export function VenueCardSkeleton({ className }: VenueCardSkeletonProps) {
  const composed = ['venue', 'venue--skeleton', className].filter(Boolean).join(' ')
  return <div className={composed} role="presentation" aria-hidden="true" data-testid="venue-skeleton" />
}
