// Pure Jellyfin batch helpers extracted from fetch_metadata_for_playlist.
// Fetch is injected as a param, no global fetch, no state imports, no mutation.

// Keep only items that still need metadata.
export function select_items_needing_metadata<T>(items: readonly T[], needs_metadata: (item: T) => boolean): T[] {
    return items.filter(needs_metadata)
}

// True when both url lists match in length and order.
// Guards against applying fetched metadata after the playlist changed.
export function urls_have_same_order(a: readonly string[], b: readonly string[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index])
}
