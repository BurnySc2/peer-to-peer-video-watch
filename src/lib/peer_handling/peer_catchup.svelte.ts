import { temp_state } from "$lib/temporary-storage.svelte"
import { p2p_video_current_time_sync } from "./peer_send.svelte"

// How often to send current video time to peers
export const VIDEO_SYNC_INTERVAL_MS = 5000

// Start catching up if this time is exceeded
const CATCH_UP_MIN_TIME_MS = 2000
// Max playback factor if catching up
const PLAYBACK_CATCH_UP_FACTOR = 1.2
// Linear interpolation starts at (1 + APPROACH_FACTOR) * CATCH_UP_MIN_TIME_MS, playback factor gets reduced
const APPROACH_FACTOR = 5

export function should_start_catching_up(time_behind_ms: number): boolean {
    return CATCH_UP_MIN_TIME_MS < time_behind_ms
}

export function should_stop_catching_up(time_behind_ms: number): boolean {
    return time_behind_ms <= 0
}

export function get_speedup_factor(time_behind_ms: number): number {
    if (time_behind_ms < 0) {
        return 1
    }
    // If time difference is too large, return catch up factor
    if ((APPROACH_FACTOR + 1) * CATCH_UP_MIN_TIME_MS < time_behind_ms) {
        return PLAYBACK_CATCH_UP_FACTOR
    }
    // Delta time is small, but still need to catch up, increase playback only a little
    const factor1 = (time_behind_ms / CATCH_UP_MIN_TIME_MS - 1) / APPROACH_FACTOR
    const factor2 = 1 + (PLAYBACK_CATCH_UP_FACTOR - 1) * factor1
    return Math.max(1 + (PLAYBACK_CATCH_UP_FACTOR / 20), factor2)
}

export function broadcast_current_time_for_sync() {
    if (temp_state.video_element === null || temp_state.video_state_paused) {
        return
    }
    p2p_video_current_time_sync({ time: temp_state.video_current_time })
}
