import type { DataConnection, Peer } from "peerjs"
import { temp_state } from "$lib/temporary-storage.svelte"
import { Message, type TMessage, type TSetupOptions } from "$lib/types/peer_to_peer"
import { connection_send_validated } from "./peer_send.svelte"

export function setup_connection(peer: Peer, conn: DataConnection, options: TSetupOptions) {
	conn.on("open", () => {
		if (options.send_init) {
			connection_send_validated(conn, {
				type: "init_connect",
				peer_ids: temp_state.peer_connections.map((c) => c.peer),
				playlist: temp_state.playlist,
				playlist_index: temp_state.playlist_index,
				video_current_time: temp_state.video_current_time,
				video_state_paused: temp_state.video_state_paused,
			})
		}
	})

	// biome-ignore lint/suspicious/noExplicitAny: data may be anything
	conn.on("data", (data: any) => {
		const data_validated: TMessage = Message.parse(data)
		switch (data_validated.type) {
			case "init_connect": {
				const peers_connected = temp_state.peer_connections.map((c) => c.peer)
				data_validated.peer_ids.forEach((peer_id) => {
					// Connect to missing peers
					if (!peers_connected.includes(peer_id)) {
						peer.connect(peer_id)
					}
				})

				// Sync local data
				temp_state.playlist = data_validated.playlist
				temp_state.playlist_index = data_validated.playlist_index
				temp_state.video_current_time = data_validated.video_current_time
				temp_state.video_state_paused = data_validated.video_state_paused
				break
			}
			case "playlist_set_current_playing":
				temp_state.playlist_index = data_validated.value
				break
			case "playlist_set":
				temp_state.playlist = data_validated.playlist
				break
			case "video_play":
				temp_state.video_state_paused = false
				break
			case "video_pause":
				// TODO: catch up and pause at target time
				temp_state.video_state_paused = true
				break
			case "video_seek_to":
				temp_state.video_state_paused = true
				temp_state.video_current_time = data_validated.time
				break
			case "video_set_playback_rate":
				temp_state.video_target_playback_speed = data_validated.value
				break
			case "video_current_time_sync":
				// TODO: If far away, catch up by increasing playback speed to:
				// 1.1 * temp_state.video_target_playback_speed
				temp_state.video_p2p_max_time = Math.max(temp_state.video_p2p_max_time, data_validated.value)
				break
			default:
				break
		}
	})

	conn.on("close", () => {
		// Clean up when peer disconnects
		temp_state.peer_connections = temp_state.peer_connections.filter((c) => c !== conn)
	})

	conn.on("error", (err) => {
		console.error("Connection error:", err)
	})

	// // Add to our list of active connections
	temp_state.peer_connections = [...temp_state.peer_connections, conn]
}
