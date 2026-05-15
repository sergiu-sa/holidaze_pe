import { useMemo } from 'react'

import type { CityEntry } from '../lib/atlas/groupByCity'
import { groupByCity } from '../lib/atlas/groupByCity'
import { useVenues, type UseVenuesState } from './useVenues'

const ATLAS_LIMIT = 100

export interface UseAtlasCitiesState {
  cities: CityEntry[]
  isLoading: boolean
  isFallback: boolean
  error: UseVenuesState['error']
  refetch: UseVenuesState['refetch']
  /** Total venues considered (after isUsable filter applied upstream). */
  totalVenues: number
  /** Wall-clock ms of the last successful underlying fetch. */
  lastFetchedAt: number | null
}

/**
 * Wraps useVenues({ limit: 100 }) and aggregates the result into city entries
 * via groupByCity. Memoised against the venues array reference so consumers
 * (Home + /atlas) can mount the same data without re-grouping per render.
 */
export interface UseAtlasCitiesOptions {
  /** Skip the fetch (e.g. when the consumer is feeding cities in via prop). */
  enabled?: boolean
}

export function useAtlasCities(options: UseAtlasCitiesOptions = {}): UseAtlasCitiesState {
  const venues = useVenues({ page: 1, limit: ATLAS_LIMIT, enabled: options.enabled ?? true })

  const cities = useMemo(() => {
    const list = venues.data ?? []
    return groupByCity(list).sort((a, b) => b.venues.length - a.venues.length)
  }, [venues.data])

  return {
    cities,
    isLoading: venues.isLoading,
    isFallback: venues.isFallback,
    error: venues.error,
    refetch: venues.refetch,
    totalVenues: venues.data?.length ?? 0,
    lastFetchedAt: venues.lastFetchedAt,
  }
}
