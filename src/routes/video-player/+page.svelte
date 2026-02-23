<script lang="ts">
// TODO Implement video player with control buttons
const playback_speeds = [0.75, 1.0, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5, 1.75, 2.0, 3.0, 4.0, 10.0]

let video_element = $state<HTMLVideoElement>()
let video_url = $state("")

// normal: show meta info below player, enable scroll
// theater:
// fullscreen: only show video unless hovering with mouse in video player, then temporarily (debounce) show controls
let mode = $state<"normal" | "theater" | "fullscreen">("normal")
let volume = $state(0.5)
let playback_position = $state(0)
let playback_speed = $state(1.0)

// Playlist would be outside of this element
let segments = $state([])

function pause_unpause() {
	// Resumes playback or pauses
}
function seek(new_playback_position: number) {
	// Seeks to target time in video
}
function set_volume(new_volume: number) {
	// Set volume to target
	// 0 to 1
}
function set_playback_speed(new_playback_speed: number) {}
function toggle_fullscreen() {}
</script>

<div class="flex flex-col items-center w-screen">
	<input class="m-2 p-2 border" bind:value={video_url} placeholder="Enter video url" />
    <!-- TODO Implement video player -->
	<video bind:this={video_element}
		controls
		muted
		playsinline
		bind:playbackRate={playback_speed}
		src={video_url}
		class="max-h-[75vh]"
	>
		Your browser does not support the video tag.
	</video>
	{#if video_element}
		<div class="flex">
			<label for="playback_speed">Playback rate</label>
			<select id="playback_speed" bind:value={playback_speed}>
				{#each playback_speeds as ps}
					<option value={ps}>{ps}</option>
				{/each}
			</select>
		</div>		
	{/if}
</div>


