<script lang="ts">
import Navigation from "$lib/components/Navigation.svelte"
import PlaybackControls from "$lib/components/ui/PlaybackControls.svelte"
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
</script>

<div class="flex flex-col max-w-screen items-center space-y-2">
    <VideoPlayer />
    <PlaybackControls />
    <Navigation />
</div>
