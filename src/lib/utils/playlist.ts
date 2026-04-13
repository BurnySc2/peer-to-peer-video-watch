import { APP_CONFIG } from "$lib/config"
import { perma_state } from "$lib/persistent-storage.svelte"

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
