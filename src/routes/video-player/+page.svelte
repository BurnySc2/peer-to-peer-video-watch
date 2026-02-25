<script lang="ts">
import PlaybackControls from "$lib/components/ui/PlaybackControls.svelte"
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
</script>

<div class="flex flex-col items-center w-screen p-4 space-y-2">
	<VideoPlayer />
	<PlaybackControls />
</div>


