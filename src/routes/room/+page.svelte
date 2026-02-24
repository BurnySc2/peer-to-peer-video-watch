<script lang="ts">
import Peer from "peerjs"
import { onMount } from "svelte"
import { page } from "$app/state"
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
let peer = $state<Peer>()

onMount(() => {
	// Handle peer id
	const my_peer_id = perma_state.global_settings.peer_id
	if (!my_peer_id) {
		// Create new peer id, assign to localStorage
		peer = new Peer()
		peer.on("open", (id) => {
			perma_state.global_settings.peer_id = id
		})
	} else {
		// Register with saved peer_id from localStorage
		peer = new Peer(my_peer_id)
	}

	peer.on("open", () => {
		// Handle room id
		if ("room_id" in query_params) {
			// Connect to peer
			if (query_params.room_id !== perma_state.global_settings.peer_id) {
				peer!.connect(query_params.room_id)
			}
		} else {
			// If 'create_room' was selected, query param will be empty
			const url = new URL(page.url)
			url.searchParams.set("room_id", perma_state.global_settings.peer_id)
			history.replaceState({}, "", url)
		}
	})
})
</script>

<div>
    alo
</div>