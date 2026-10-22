<script lang="ts">
import Peer from "peerjs"
import { onDestroy, onMount } from "svelte"
import { beforeNavigate } from "$app/navigation"
import { page } from "$app/state"
import Navigation from "$lib/components/Navigation.svelte"
import PlaybackControls from "$lib/components/ui/PlaybackControls.svelte"
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
import { broadcast_current_time_for_sync, VIDEO_SYNC_INTERVAL_MS } from "$lib/peer_handling/peer_catchup.svelte"
import { handle_peer_on_connection } from "$lib/peer_handling/peer_on_connection.svelte"
import { handle_peer_on_assign_id, handle_peer_on_open, set_room_url } from "$lib/peer_handling/peer_on_open.svelte"
import {
    p2p_send_playlist_set,
    p2p_send_subtitle_offset,
    p2p_send_video_pause,
    p2p_send_video_play,
    p2p_send_video_seek_to,
    p2p_send_video_set_playback_rate,
} from "$lib/peer_handling/peer_send.svelte"
import { teardown_room } from "$lib/peer_handling/peer_teardown.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { get_search_params } from "$lib/utils/url_utils"

// Parse query parameters from URL
let query_params = $derived(get_search_params(page.url.href)[1])
let room_id = $derived.by(() => {
    if ("room_id" in query_params) {
        return query_params.room_id
    }
    return null
})
let peer = $state<Peer>()
let timer_sync_time: number | undefined

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
        if (room_id === null) {
            set_room_url(perma_state.global_settings.peer_id)
        }
    }

    handle_peer_on_open(peer, room_id)
    handle_peer_on_connection(peer)

    // Broadcast current time to keep peers in sync (this may adjust playback rate)
    timer_sync_time = setInterval(broadcast_current_time_for_sync, VIDEO_SYNC_INTERVAL_MS)
    return () => {
        if (timer_sync_time !== undefined) {
            clearInterval(timer_sync_time)
        }
        teardown_room(peer)
    }
})

onDestroy(() => {
    // Teardown P2P state when leaving the room (idempotent with onMount cleanup)
    if (timer_sync_time !== undefined) {
        clearInterval(timer_sync_time)
    }
    teardown_room(peer)
})

beforeNavigate(() => {
    // Clear sync timer and wipe P2P state before leaving the room
    if (timer_sync_time !== undefined) {
        clearInterval(timer_sync_time)
    }
    teardown_room(peer)
})
</script>

<div class="flex flex-col items-center max-w-screen space-y-2">
    <VideoPlayer
        send_video_play={p2p_send_video_play}
        send_video_pause={p2p_send_video_pause}
        send_video_seek_to={p2p_send_video_seek_to}
    />
    <PlaybackControls
        send_playlist_set={p2p_send_playlist_set}
        send_video_set_playback_rate={p2p_send_video_set_playback_rate}
        send_subtitle_offset={p2p_send_subtitle_offset}
    />
    <Navigation />
</div>
