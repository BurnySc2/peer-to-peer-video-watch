<script lang="ts">
import Peer from "peerjs"
import { onMount } from "svelte"
import { page } from "$app/state"
import PlaybackControls from "$lib/components/ui/PlaybackControls.svelte"
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
import { handle_peer_on_connection } from "$lib/peer_handling/peer_on_connection.svelte"
import { handle_peer_on_assign_id, handle_peer_on_open } from "$lib/peer_handling/peer_on_open.svelte"
import {
	p2p_send_playlist_set,
	p2p_send_video_pause,
	p2p_send_video_play,
	p2p_send_video_seek_to,
	p2p_send_video_set_playback_rate,
} from "$lib/peer_handling/peer_send.svelte"
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
		peer = new Peer()
		handle_peer_on_assign_id(peer, room_id)
	} else {
		// Register with saved peer_id from localStorage
		peer = new Peer(my_peer_id)
	}

	handle_peer_on_open(peer, room_id)
	handle_peer_on_connection(peer)
})
</script>

<div class="flex flex-col items-center max-w-screen p-4 space-y-2">
    <VideoPlayer send_video_play={p2p_send_video_play} send_video_pause={p2p_send_video_pause} send_video_seek_to={p2p_send_video_seek_to} />
	<PlaybackControls send_playlist_set={p2p_send_playlist_set} send_video_set_playback_rate={p2p_send_video_set_playback_rate} />
</div>