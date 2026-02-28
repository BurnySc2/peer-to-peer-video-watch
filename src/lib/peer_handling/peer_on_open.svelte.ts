import type Peer from "peerjs"
import { replaceState } from "$app/navigation"
import { page } from "$app/state"
import { perma_state } from "$lib/persistent-storage.svelte"
import { setup_connection } from "./peer_setup_connection.svelte"

function set_room_url(room_id: string) {
    // TODO: Always set the room_id to peer id? Maybe after connection is established
    const url = new URL(page.url)
    url.searchParams.set("room_id", room_id)
    replaceState(url, "")
}

export function handle_peer_on_assign_id(peer: Peer, room_id: string | null) {
    peer.on("open", (id) => {
        perma_state.global_settings.peer_id = id
        // If 'create_room' was selected, query param will be empty
        if (room_id === null) {
            set_room_url(id)
        }
    })
}

export function handle_peer_on_open(peer: Peer, room_id: string | null) {
    // Connect to peer with peerID == roomID
    peer.on("open", () => {
        if (room_id !== null && room_id !== perma_state.global_settings.peer_id) {
            const conn = peer.connect(room_id)
            setup_connection(peer, conn, { send_init: false })
        } else if (room_id === null) {
            set_room_url(perma_state.global_settings.peer_id)
        }
    })
}
