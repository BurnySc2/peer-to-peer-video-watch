<script lang="ts">
import PlaybackControls from "$lib/components/ui/PlaybackControls.svelte"
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
</script>

<div class="flex flex-col max-w-screen min-h-screen items-center p-4 space-y-2 bg-gray-900 text-white">
    <VideoPlayer />
    <PlaybackControls />
</div>
