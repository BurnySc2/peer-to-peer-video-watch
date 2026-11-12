import type { TPlayListItem } from "$lib/temporary-storage.svelte"

export type TRemoveWatchedResult = {
    playlist: TPlayListItem[]
    playlist_index: number
    removed_count: number
    removed_current: boolean
}

/**
 * Remove watched (`played_complete`) items without mutating the input.
 *
 * Corrects the overcount at PlaybackControls.svelte:241-258, which subtracted
 * the total removed count even when removed items were after the current index.
 */
export function remove_watched_playlist_items(playlist: TPlayListItem[], playlist_index: number): TRemoveWatchedResult {
    if (!playlist.some((item) => item.played_complete)) {
        return { playlist, playlist_index, removed_count: 0, removed_current: false }
    }
    const filtered = playlist.filter((item) => !item.played_complete)
    if (playlist_index < 0 || playlist_index >= playlist.length) {
        return {
            playlist: filtered,
            playlist_index: filtered.length > 0 ? 0 : -1,
            removed_count: 0,
            removed_current: false,
        }
    }
    let removed_count = 0
    for (let i = 0; i < playlist_index; i++) {
        if (playlist[i].played_complete) {
            removed_count += 1
        }
    }
    const removed_current = playlist[playlist_index].played_complete
    if (filtered.length === 0) {
        return { playlist: filtered, playlist_index: -1, removed_count, removed_current }
    }
    if (removed_current) {
        return {
            playlist: filtered,
            playlist_index: Math.min(playlist_index - removed_count, filtered.length - 1),
            removed_count,
            removed_current,
        }
    }
    return { playlist: filtered, playlist_index: playlist_index - removed_count, removed_count, removed_current }
}
