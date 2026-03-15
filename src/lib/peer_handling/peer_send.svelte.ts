import type { DataConnection } from "peerjs"
import { perma_state } from "$lib/persistent-storage.svelte"
import type { TPlayListItem } from "$lib/temporary-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { TMessage } from "$lib/types/peer_to_peer"
import { format_time } from "$lib/utils/format_time"

export function broadcast(data: TMessage) {
    temp_state.peer_connections.forEach((conn) => {
        if (conn.open) {
            connection_send_validated(conn, data)
        }
    })
}

export function connection_send_validated(conn: DataConnection, data: TMessage) {
    conn.send(data)
}

export function p2p_send_playlist_set(message: { playlist: TPlayListItem[]; playlist_index: number }) {
    broadcast({ type: "playlist_set", playlist: message.playlist, playlist_index: message.playlist_index })
    console.log("broadcasting playlist set")
}
export function p2p_send_video_play(time: number) {
    broadcast({ type: "video_play", time: time })
    console.log("broadcasting play")
}
export function p2p_send_video_pause(time: number) {
    broadcast({ type: "video_pause", time: time })
    console.log("broadcasting pause")
}
export function p2p_send_video_seek_to(time: number) {
    broadcast({ type: "video_seek_to", time: time })
    console.log("broadcasting seek to ", format_time(time))
}
export function p2p_send_video_set_playback_rate(message: { time: number; value: number }) {
    broadcast({ type: "video_set_playback_rate", time: message.time, value: message.value })
    console.log("broadcasting playback rate ", message.value)
}
export function p2p_video_current_time_sync(message: { time: number }) {
    broadcast({ type: "video_current_time_interval", time: message.time, timestamp_now: Date.now() })
}
export function p2p_send_ready_check() {
    if (temp_state.peer_connections.length === 0) {
        console.log("Ready check not run - no peers are connected")
        return
    }
    if (temp_state.ready_peers.size > 0) {
        console.log("Ready check already active")
        return
    }
    broadcast({ type: "start_ready_check", peer_id: perma_state.global_settings.peer_id })
    temp_state.ready_peers = new Set(temp_state.ready_peers).add(perma_state.global_settings.peer_id)
    console.log("broadcasting start ready check")
}
export function p2p_send_ready() {
    broadcast({ type: "send_ready", peer_id: perma_state.global_settings.peer_id })
    temp_state.ready_peers = new Set(temp_state.ready_peers).add(perma_state.global_settings.peer_id)
    console.log("broadcasting send_ready")
}
export function p2p_send_subtitle_offset() {
    broadcast({ type: "send_subtitle_offset", subtitle_offset: temp_state.subtitles.offset })
    console.log("broadcasting subtitle_offset ", temp_state.subtitles.offset)
}
export function p2p_send_emote(id: string, emote: string) {
    broadcast({ type: "send_emote", id, emote })
    console.log("broadcasting emote", emote)
}
