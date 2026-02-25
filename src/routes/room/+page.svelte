<script lang="ts">
import Peer from "peerjs"
import { onMount } from "svelte"
import { page } from "$app/state"
import { handle_peer_on_connection } from "$lib/peer_handling/peer_on_connection.svelte"
import { handle_peer_on_assign_id, handle_peer_on_open } from "$lib/peer_handling/peer_on_open.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"

// Parse query parameters from URL
let query_params = $derived.by(() => {
	const url = new URL(page.url)
	const params = new URLSearchParams(url.search)
	const result: Record<string, string> = {}
	for (const [key, value] of params) {
		result[key] = value
	}
	return result
})
let room_id = $derived.by(() => {
	if ("room_id" in query_params) {
		return query_params.room_id
	}
	return null
})
let peer = $state<Peer>()

onMount(() => {
	// Handle peer id
	const my_peer_id = perma_state.global_settings.peer_id
	if (!my_peer_id) {
		// Create new peer id, assign to localStorage
		peer = new Peer(perma_state.global_settings.peer_id)
		handle_peer_on_assign_id(peer)
	} else {
		// Register with saved peer_id from localStorage
		peer = new Peer(my_peer_id)
	}

	handle_peer_on_open(peer, room_id)
	handle_peer_on_connection(peer)
})
</script>

<div>
    alo
</div>