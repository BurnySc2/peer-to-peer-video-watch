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
