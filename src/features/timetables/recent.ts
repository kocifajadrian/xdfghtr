const KEY = 'ubian.recentSearches'
const MAX = 3

export type RecentSearch = { from: string; to: string }

export function readRecent(): RecentSearch[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is RecentSearch => typeof item?.from === 'string' && typeof item?.to === 'string',
    )
  } catch {
    return [] // storage can be blocked (private windows)
  }
}

/** Puts a search first and keeps the last few. Returns the new list. */
export function rememberSearch(search: RecentSearch): RecentSearch[] {
  const next = [search, ...readRecent().filter((r) => r.from !== search.from || r.to !== search.to)].slice(
    0,
    MAX,
  )
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}
