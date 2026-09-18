<script lang="ts">
import { onMount } from "svelte"
import Navigation from "$lib/components/Navigation.svelte"
import PlaybackControls from "$lib/components/ui/PlaybackControls.svelte"
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
import { teardown_room } from "$lib/peer_handling/peer_teardown.svelte"

onMount(() => {
    // Ensure clean solo state when entering standalone player (no Peer)
    teardown_room(null)
})
</script>

<div class="flex flex-col max-w-screen items-center space-y-2">
    <VideoPlayer />
    <PlaybackControls />
    <Navigation />
</div>
