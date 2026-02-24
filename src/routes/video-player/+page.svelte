<script lang="ts">
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { TMessage } from "$lib/types/peer_to_peer"
import { PLAYBACK_SPEED_VALUES } from "$lib/types/video_player"

// TODO Implement video player with control buttons

let video_element = $state<HTMLVideoElement>()
let video_url = $state("")

// normal: show meta info below player, enable scroll
// theater:
// fullscreen: only show video unless hovering with mouse in video player, then temporarily (debounce) show controls
let mode = $state<"normal" | "theater" | "fullscreen">("normal")

function toggle_fullscreen() {}
</script>

<div class="flex flex-col items-center w-screen">
	<!-- TODO Implement controls of adding and removing from playlist -->
	 <div class="max-h-[75vh]">
		<VideoPlayer />
	 </div>
	{#if video_element}
		<div class="flex">
			<label for="playback_speed">Playback rate</label>
			<select id="playback_speed" bind:value={temp_state.video_playback_speed}>
				{#each PLAYBACK_SPEED_VALUES as ps}
					<option value={ps}>{ps}</option>
				{/each}
			</select>
		</div>		
	{/if}
</div>


