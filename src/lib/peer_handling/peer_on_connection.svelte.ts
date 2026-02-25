import type Peer from "peerjs"
import { setup_connection } from "./peer_setup_connection.svelte"

// When someone connects to us
export function handle_peer_on_connection(peer: Peer) {
	peer.on("connection", (conn) => {
		setup_connection(peer, conn, { send_init: true })
	})
}
