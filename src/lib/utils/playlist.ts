import { APP_CONFIG } from "$lib/config"
import { perma_state } from "$lib/persistent-storage.svelte"
import type { TPlayListItem } from "$lib/temporary-storage.svelte"

// Add url to recent_playlist_items
// Keep list to fixed length
export function add_recent_playlist_item(url: string): void {
    if (!url) {
        return
    }
    const new_item = { title: "", url }
    const recent_items = perma_state.global_settings.recent_playlist_items
    const index = recent_items.findIndex((item) => item.url === url)

    // url already in items, reorder list and return
    if (index !== -1) {
        const existing = recent_items[index]
        const updated = [existing, ...recent_items.filter((item) => item.url !== url)]
        perma_state.global_settings.recent_playlist_items = updated.slice(
            0,
            APP_CONFIG.recent_playlist_items_max_length,
        )
        return
    }

    // add new url
    const updated = [new_item, ...recent_items]
    perma_state.global_settings.recent_playlist_items = updated.slice(0, APP_CONFIG.recent_playlist_items_max_length)
}

export function update_title_playlist_items(url: string, title: string) {
    if (!url || !title) {
        return
    }

    const recent_items = perma_state.global_settings.recent_playlist_items
    const index = recent_items.findIndex((item) => item.url === url)

    if (index !== -1) {
        if (!title) {
            return
        }
        const updated = [...recent_items]
        updated[index].title = title
        perma_state.global_settings.recent_playlist_items = updated
    }
}

export function calc_playlist_remaining(
    playlist: TPlayListItem[],
    playlist_index: number,
    live_duration: number,
    live_position: number,
    raw_rate: number,
): { remaining_sec: number; unknown_count: number; rate: number; visible: boolean } {
    if (playlist.length === 0) {
        return { remaining_sec: 0, unknown_count: 0, rate: 1, visible: false }
    }
    const rate = typeof raw_rate === "number" && Number.isFinite(raw_rate) && raw_rate > 0 ? raw_rate : 1
    const start = playlist_index >= 0 && playlist_index < playlist.length ? playlist_index : -1
    let remaining_sec = 0
    let known_count = 0
    let unknown_count = 0
    if (start >= 0) {
        if (Number.isFinite(live_duration) && live_duration > 0) {
            remaining_sec += Math.max(0, live_duration - (Number.isFinite(live_position) ? live_position : 0)) / rate
            known_count += 1
        } else {
            const current = playlist[start]
            const played = current.played_progress ?? 0
            if (
                typeof current.duration_sec === "number" &&
                Number.isFinite(current.duration_sec) &&
                current.duration_sec > 0
            ) {
                remaining_sec += Math.max(0, current.duration_sec - (Number.isFinite(played) ? played : 0)) / rate
                known_count += 1
            } else {
                unknown_count += 1
            }
        }
    }
    for (let i = start + 1; i < playlist.length; i++) {
        const item = playlist[i]
        const played = item.played_progress ?? 0
        if (typeof item.duration_sec === "number" && Number.isFinite(item.duration_sec) && item.duration_sec > 0) {
            remaining_sec += Math.max(0, item.duration_sec - (Number.isFinite(played) ? played : 0)) / rate
            known_count += 1
        } else {
            unknown_count += 1
        }
    }
    return { remaining_sec, unknown_count, rate, visible: known_count > 0 }
}
