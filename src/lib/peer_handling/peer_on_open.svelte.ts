import type Peer from "peerjs"
import { page } from "$app/state"
import { perma_state } from "$lib/persistent-storage.svelte"
import { setup_connection } from "./peer_setup_connection.svelte"

export function handle_peer_on_assign_id(peer: Peer) {
	peer.on("open", (id) => {
		perma_state.global_settings.peer_id = id
	})
}

export function handle_peer_on_open(peer: Peer, room_id: string | null) {
	// Connect to peer with peerID == roomID
	if (room_id && room_id !== perma_state.global_settings.peer_id) {
		const conn = peer.connect(room_id)
		setup_connection(peer, conn, { send_init: false })
	}
	// If 'create_room' was selected, query param will be empty
	if (room_id === null) {
		// TODO: Always set the room_id to peer id?
		const url = new URL(page.url)
		url.searchParams.set("room_id", perma_state.global_settings.peer_id)
		history.replaceState({}, "", url)
	}
}
