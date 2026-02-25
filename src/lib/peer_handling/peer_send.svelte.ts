import type { DataConnection } from "peerjs"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { TMessage } from "$lib/types/peer_to_peer"

export function broadcast(data: TMessage) {
	temp_state.peer_connections.forEach((conn) => {
		connection_send_validated(conn, data)
	})
}

export function connection_send_validated(conn: DataConnection, data: TMessage) {
	conn.send(data)
}

export function p2p_send_playlist_set(message: { playlist: string[]; playlist_index: number }) {
	broadcast({ type: "playlist_set", playlist: message.playlist, playlist_index: message.playlist_index })
}
export function p2p_send_video_play(time: number) {
	broadcast({ type: "video_play", time: time })
}
export function p2p_send_video_pause(time: number) {
	broadcast({ type: "video_pause", time: time })
}
export function p2p_send_video_seek_to(time: number) {
	broadcast({ type: "video_seek_to", time: time })
}
export function p2p_send_video_set_playback_rate(message: { time: number; value: number }) {
	broadcast({ type: "video_set_playback_rate", time: message.time, value: message.value })
}
