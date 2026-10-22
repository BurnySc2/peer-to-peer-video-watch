import type { Peer } from "peerjs"
import { temp_state } from "$lib/temporary-storage.svelte"
import { stop_reconnect_loop } from "./peer_setup_connection.svelte"

export type TeardownOptions = {
    // Extra intervals to clear
    intervals?: Array<number>
}

// Leave a room: close connections, destroy peer, reset playback state.
export function teardown_room(peer: Peer | null | undefined, options?: TeardownOptions): void {
    // Clear intervals
    if (options?.intervals) {
        for (const interval_id of options.intervals) {
            try {
                clearInterval(interval_id)
            } catch {}
        }
    }

    // Stop reconnects
    try {
        stop_reconnect_loop()
    } catch {}

    // Close connections
    for (const peer_id of Object.keys(temp_state.peer_connections)) {
        try {
            temp_state.peer_connections[peer_id].conn.close()
        } catch {}
    }

    // Destroy peer if present
    if (peer) {
        try {
            peer.destroy()
        } catch {}
    }

    // Reset state
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
}
