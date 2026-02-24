<script lang="ts">
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { TMessage } from "$lib/types/peer_to_peer"
import { PLAYBACK_SPEED_VALUES } from "$lib/types/video_player"

// TODO Implement video player with control buttons

// normal: show meta info below player, enable scroll
// theater:
// fullscreen: only show video unless hovering with mouse in video player, then temporarily (debounce) show controls
let mode = $state<"normal" | "theater" | "fullscreen">("normal")

function toggle_fullscreen() {}
</script>

<div class="flex flex-col items-center w-screen">
	<!-- TODO Implement controls of adding and removing from playlist -->
	 <div class="">
		<VideoPlayer />
	 </div>
	<div class="flex items-center space-x-2">
		<label for="playback_speed">Playback rate</label>
		<select class="border m-2" id="playback_speed" bind:value={temp_state.video_playback_speed}>
			{#each PLAYBACK_SPEED_VALUES as ps}
				<option value={ps}>{ps}</option>
			{/each}
		</select>
	</div>
	<div class="flex items-center space-x-2">
		<label for="">Autoplay</label>
		<input type="checkbox" name="" id="">
	</div>
	<div class="flex items-center space-x-2">
		<input type="url" name="" id="" placeholder="New playlist item">
		<button class="p-2 border hover:bg-green-400">Add to playlist</button>
	</div>
</div>


