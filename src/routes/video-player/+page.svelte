<script lang="ts">
import VideoPlayer from "$lib/components/ui/VideoPlayer.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { PLAYBACK_SPEED_VALUES } from "$lib/types/video_player"

// TODO Implement video player with control buttons

// Input items
let input_new_playlist_url = $state("")
let select_playlist_items = $state<string[]>([])

// normal: show meta info below player, enable scroll
// theater:
// fullscreen: only show video unless hovering with mouse in video player, then temporarily (debounce) show controls
let mode = $state<"normal" | "theater" | "fullscreen">("normal")

function add_playlist_item(_event: Event) {
	if (!input_new_playlist_url) {
		return
	}
	if (!temp_state.playlist.includes(input_new_playlist_url)) {
		temp_state.playlist.push(input_new_playlist_url)
	}
	input_new_playlist_url = ""
}
function delete_playlist_item(_event: Event) {
	// Delete items, set new index
	const current_playing_url = temp_state.playlist[temp_state.playlist_index]
	temp_state.playlist = temp_state.playlist.filter(
		(url) => url === current_playing_url || !select_playlist_items.includes(url),
	)
	const new_index = temp_state.playlist.indexOf(current_playing_url)
	temp_state.playlist_index = new_index
}
function set_playlist_index() {
	const target_index = temp_state.playlist.indexOf(select_playlist_items[0])
	if (target_index === temp_state.playlist_index) {
		return
	}
	temp_state.playlist_index = target_index
	temp_state.video_current_time = 0
	temp_state.video_p2p_max_time = 0
	temp_state.video_state_paused = true
	temp_state.video_can_play = false
}

// function toggle_fullscreen() {}
</script>

<div class="flex flex-col items-center w-screen p-4 space-y-2">
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
		<label for="autoplay">Autoplay</label>
		<input type="checkbox" id="autoplay">
	</div>
	<div class="flex items-center space-x-2">
		<input type="url" placeholder="New playlist item" bind:value={input_new_playlist_url}>
		<button class="p-2 border hover:bg-green-400" onclick={add_playlist_item}>Add to playlist</button>
	</div>
	<div class="flex items-center space-x-2">
		<label for="select-playlist">Current playlist</label>
		<select id="select-playlist" multiple bind:value={select_playlist_items}>
			{#each temp_state.playlist as playlist_item}
				<option value={playlist_item}>{playlist_item}</option>
			{/each}
		</select>
		<button 
			class:opacity-0={select_playlist_items.length !== 1}
			disabled={select_playlist_items.length < 1}
			onclick={set_playlist_index}>
			Play
		</button>
		<button 
			class:opacity-0={select_playlist_items.length < 1}
			disabled={select_playlist_items.length < 1}
			onclick={delete_playlist_item}>
			Delete
		</button>
	</div>
</div>


