import type { Peer } from "peerjs"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { stop_reconnect_loop } from "./peer_setup_connection.svelte"

export type TeardownOptions = {
    // Extra interval ids the caller wants cleared during teardown
    intervals?: Array<number>
}

// Central P2P teardown used when leaving a room.
// Closes connections, destroys the peer, stops reconnects,
// and wipes playback state so solo pages start clean.
export function teardown_room(peer: Peer | null | undefined, options?: TeardownOptions): void {
    // Clear caller-provided intervals (sync timer etc.)
    if (options?.intervals) {
        for (const interval_id of options.intervals) {
            try {
                clearInterval(interval_id)
            } catch {
                // Ignore invalid interval ids
            }
        }
    }

    // Stop automatic host reconnect attempts
    try {
        stop_reconnect_loop()
    } catch {
        // Ignore teardown errors
    }

    // Close all open data connections
    for (const peer_id of Object.keys(temp_state.peer_connections)) {
        try {
            temp_state.peer_connections[peer_id].conn.close()
        } catch {
            // Ignore close errors during teardown
        }
    }

    // Destroy the local peer object if present
    if (peer) {
        try {
            peer.destroy()
        } catch {
            // Ignore destroy errors during teardown
        }
    }

    // Stop playback on the detached video element
    try {
        temp_state.video_element?.pause()
    } catch {
        // Ignore pause errors during teardown
    }

    // Reset transient P2P and playback state to initial values
    temp_state.peer_connections = {}
    temp_state.ready_peers = []
    temp_state.playlist = []
    temp_state.playlist_index = -1
    temp_state.video_current_time = 0
    temp_state.video_p2p_max_time = 0
    temp_state.video_playback_speed = 1
    temp_state.video_target_playback_speed = 1
    temp_state.video_state_paused = true
    temp_state.is_catching_up = false
    temp_state.video_can_play = false
    temp_state.video_duration = 0
    temp_state.video_title = ""
    temp_state.video_element = null
    temp_state.subtitles = {
        enabled: false,
        active_url: "",
        offset: 0,
    }
    temp_state.emote_state = []

    // Unload saved peer id so the next room gets a fresh identity
    perma_state.global_settings.peer_id = ""
}
