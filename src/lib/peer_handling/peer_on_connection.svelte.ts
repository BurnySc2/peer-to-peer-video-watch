import type Peer from "peerjs"
import toast from "svelte-5-french-toast"
import { setup_connection } from "./peer_setup_connection.svelte"

// When someone connects to us
export function handle_peer_on_connection(peer: Peer) {
    peer.on("connection", (conn) => {
        // TODO: Toast message on connect?
        console.log("Someone connected to us", conn.peer)
        toast.success(`${conn.peer} connected`, { duration: 5000, position: "top-right" })
        setup_connection(peer, conn, { send_init: true })
    })
}
