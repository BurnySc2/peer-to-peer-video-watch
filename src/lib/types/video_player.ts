import { peer_count, temp_state } from "$lib/temporary-storage.svelte"

export const PLAYBACK_SPEED_VALUES = [
    1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6, 1.7, 1.75, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 3, 3.5, 4,
]

export function solo_watch_set_player_progress() {
    // If watching solo, set the video element progress to the (previous) progress of the playlist item for resume watching
    if (!peer_count()) {
        const playlist_item = temp_state.playlist[temp_state.playlist_index]
        if (playlist_item.played_progress <= 0) {
            return
        }
        if (temp_state.video_element) {
            temp_state.video_element.currentTime = playlist_item.played_progress
        }
    }
}
