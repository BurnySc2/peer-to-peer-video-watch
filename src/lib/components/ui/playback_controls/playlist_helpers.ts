// Pure playlist math extracted from PlaybackControls.svelte.
// No fetch, no state mutation, no Svelte runes, no state imports.

// Minimal structural item so this module stays decoupled from stores.
export interface PlaylistItemLike {
    url: string
    video_title: string
    subtitles_original_url: string
    played_progress: number
    played_complete: boolean
}

// Fresh item with empty metadata, matching add_playlist_item.
export function build_new_playlist_item(url: string): PlaylistItemLike {
    return {
        url,
        video_title: "",
        subtitles_original_url: "",
        played_progress: 0,
        played_complete: false,
    }
}

// True when the url is already in the playlist and must be rejected.
export function reject_duplicate_url(playlist: readonly { url: string }[], url: string): boolean {
    return playlist.some((item) => item.url === url)
}

// Keep the playing item plus every unselected item, then locate the playing item.
// Matches delete_playlist_item, never mutates the input array.
export function filter_playlist_deleting_selected<T extends { url: string }>(
    playlist: readonly T[],
    selected: readonly string[],
    playing_url: string,
): { next: T[]; next_index: number } {
    const next = playlist.filter((item) => item.url === playing_url || !selected.includes(item.url))
    const next_index = next.findIndex((item) => item.url === playing_url)
    return { next, next_index }
}

// Index of the selected url, matching set_playlist_index.
export function index_for_selected_url(playlist: readonly { url: string }[], selected_url: string): number {
    return playlist.findIndex((item) => item.url === selected_url)
}

// Count removed items before the playing index so it can shift down.
// Matches the deleted_items_before_index loop in remove_watched_items.
export function count_deletions_before_index<T>(
    playlist: readonly T[],
    playlist_index: number,
    is_deleted: (item: T, index: number) => boolean,
): number {
    let count = 0
    playlist.forEach((item, index) => {
        if (index < playlist_index && is_deleted(item, index)) {
            count += 1
        }
    })
    return count
}

// Split a list into batches of at most size items.
export function chunk_into_batches<T>(items: readonly T[], size: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += size) {
        batches.push(items.slice(i, i + size))
    }
    return batches
}

// True when both lists hold the same urls in the same order.
// Matches the arrays_equal guard in fetch_metadata_for_playlist.
export function playlists_have_same_order(a: readonly { url: string }[], b: readonly { url: string }[]): boolean {
    return a.length === b.length && a.every((item, index) => item.url === b[index].url)
}
