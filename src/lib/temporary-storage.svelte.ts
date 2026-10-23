import type { DataConnection } from "peerjs"
import type { PlayListItem } from "$lib/types/peer_to_peer"

export type { PlayListItem }

export type PeerConnectionMeta = {
    conn: DataConnection
    last_seen: number
}

export interface TempState {
    emote_state: { id: string; src: string }[]
    playlist: PlayListItem[]
    playlist_index: number
    autoplay: boolean
    ready_peers: string[]
    peer_connections: Record<string, PeerConnectionMeta>
    subtitles: { enabled: boolean; active_url: string; offset: number }
    is_muted: boolean
    is_catching_up: boolean
    is_sleeping: boolean
    jellyfin_my_id: string | null
    // May be different when catching up to other clients
    video_playback_speed: number
    // Use 'video_target_playback_speed' as goal, but use 'video_playback_speed' to catch up
    video_target_playback_speed: number
    // Max time of any connected client. If difference to current time is larger than threshold, try to catch up
    video_p2p_max_time: number
    // Video player data
    video_current_time: number
    video_duration: number
    video_state_paused: boolean
    // In sync with "oncanplay" event, will be false on load and when seeking
    video_can_play: boolean
    video_element: HTMLVideoElement | null
    video_title: string
}

export const temp_state: TempState = $state({
    emote_state: [],
    playlist: [],
    playlist_index: -1,
    autoplay: false,
    ready_peers: [],
    peer_connections: {},
    subtitles: {
        enabled: false,
        active_url: "",
        offset: 0,
    },
    is_muted: false,
    is_catching_up: false,
    is_sleeping: false,
    jellyfin_my_id: null,
    video_playback_speed: 1,
    video_target_playback_speed: 1,
    video_p2p_max_time: 0,
    video_current_time: 0,
    video_duration: 0,
    video_state_paused: true,
    video_can_play: false,
    video_element: null,
    video_title: "",
})

export function peer_count(): number {
    return Object.keys(temp_state.peer_connections).length
}
