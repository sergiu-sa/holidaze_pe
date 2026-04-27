import type { Venue } from '../types/venue'

// Filter for the messy Noroff public dataset. Rules re-derived from
// wip_prototype/js/api.js (CLAUDE.md §3.6 — read the rules, implement clean).

const PLACEHOLDER_IMAGE_HOSTS =
  /(example\.com|placeholder|lorempixel|via\.placeholder|test\.)/i

const REAL_IMAGE_CDNS =
  /(unsplash|pexels|cloudinary|imgix|akamai|wixstatic|images\.ctfassets|amazonaws)/i

const IMAGE_FILE_EXTENSION = /\.(jpe?g|png|webp|avif)(\?.*)?$/i

const PLACEHOLDER_NAME_PREFIXES =
  /^(string|test|asdf|todo|xxx|aaaa|qwer|lorem|ipsum)/i

const STARTS_WITH_LETTER = /^[A-Za-zÀ-ÿ]/

const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 80
const MIN_PRICE = 1
const MAX_PRICE = 50_000

export interface IsUsableOptions {
  allowEmptyMedia?: boolean
}

export function isUsable(
  venue: Venue | null | undefined,
  options: IsUsableOptions = {},
): boolean {
  if (!venue) return false

  const name = venue.name.trim()
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) return false
  if (PLACEHOLDER_NAME_PREFIXES.test(name)) return false

  const { price } = venue
  if (!Number.isFinite(price) || price < MIN_PRICE || price > MAX_PRICE) return false

  const city = venue.location.city?.trim() ?? ''
  if (!city || !STARTS_WITH_LETTER.test(city)) return false

  const firstMediaUrl = venue.media[0]?.url
  if (!firstMediaUrl) return Boolean(options.allowEmptyMedia)
  if (!/^https?:\/\//i.test(firstMediaUrl)) return false
  if (PLACEHOLDER_IMAGE_HOSTS.test(firstMediaUrl)) return false
  if (!IMAGE_FILE_EXTENSION.test(firstMediaUrl) && !REAL_IMAGE_CDNS.test(firstMediaUrl)) {
    return false
  }

  return true
}
