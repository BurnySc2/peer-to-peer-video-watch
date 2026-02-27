<script lang="ts">
import { Toaster } from "svelte-5-french-toast"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"
import NewControls from "./NewControls.svelte"

interface MyProps {
	send_video_play?: (time: number) => void
	send_video_pause?: (time: number) => void
	send_video_seek_to?: (time: number) => void
}

let {
	send_video_play = (time: number) => {
		console.log("Sending video_play", time)
	},
	send_video_pause = (time: number) => {
		console.log("Sending video_pause", time)
	},
	send_video_seek_to = (time: number) => {
		console.log("Sending video_seek_to", time)
	},
}: MyProps = $props()

let player_container: HTMLDivElement | null = null
let controls_opacity = $state(1)
let hide_timeout: number | null = null

function toggle_fullscreen() {
	if (!document.fullscreenElement) {
		player_container?.requestFullscreen()
	} else {
		document.exitFullscreen()
	}
}

function local_can_play(_event: Event) {
	temp_state.video_can_play = true
	console.log("canplay event fired")
}

let mouse_in_controls = false
function debounce_mouse_move(_event: Event) {
	// Clear any existing timeout
	if (hide_timeout) {
		clearTimeout(hide_timeout)
		hide_timeout = null
	}

	// Show controls immediately
	controls_opacity = 1

	// Set a timeout to hide controls after 3 seconds
	hide_timeout = setTimeout(() => {
		if (!mouse_in_controls) controls_opacity = 0
	}, 1000) as unknown as number
}

// Fetch video title (for Jellyfin links only)
let vid_title = $state("")
let last_url = "" // Prevent issue: quickly changing videos -> incorrect name
async function get_file_name(url: string) {
	url = url.replace("/Download", "")
	last_url = url
	try {
		const res = await fetch(url, { credentials: "include" })
		const data: JellyfinItem = await res.json()

		if (url === last_url) {
			if (data.SeriesName)
				vid_title = `${data.SeriesName} - S${data.ParentIndexNumber ?? "?"}:E${data.IndexNumber ?? "?"} - ${data.Name ?? "Untitled"}}`
			else vid_title = data.SortName ?? data.Name ?? ""
			if (vid_title !== "" && data.ProductionYear) vid_title += ` (${data.ProductionYear})`
		}
	} catch (err) {
		console.warn("Metadata fetch failed:", err)
		if (url === last_url) vid_title = ""
	}
}
$effect(() => {
	const url = temp_state.playlist[temp_state.playlist_index]
	if (!url || !url.includes("vodching")) return

	get_file_name(url)
})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={player_container}
	class="relative w-full h-full"
	onmousemove={debounce_mouse_move}
	onpointerdown={debounce_mouse_move}
>
	{#if temp_state.playlist[temp_state.playlist_index] === undefined}
		<div class="p-6 w-full text-center text-xl">
			Enter a link below to begin.
		</div>
	{:else}
		<Toaster />
		<video
			bind:this={temp_state.video_element}
			class="flex w-full h-full"
			muted={false}
			playsinline
			bind:volume={perma_state.global_settings.volume}
			bind:playbackRate={temp_state.video_playback_speed}
			bind:paused={temp_state.video_state_paused}
			bind:currentTime={temp_state.video_current_time}
			bind:duration={temp_state.video_duration}
			src={temp_state.playlist[temp_state.playlist_index]}
			oncanplay={local_can_play}
		>
			Your browser does not support the video tag.
		</video>
		<NewControls
			title={vid_title}
			{send_video_play}
			{send_video_pause}
			{send_video_seek_to}
			{toggle_fullscreen}
			bind:controls_opacity
			onMouseEnterControls={() => (mouse_in_controls = true)}
			onMouseLeaveControls={() => (mouse_in_controls = false)}
		/>
	{/if}
</div>
<!-- <div id="experimental">
	<button
		onclick={() =>
			get_file_name(temp_state.playlist[temp_state.playlist_index])}
		class="p-2 rounded-lg hover:bg-blue-400"
	>
		Title {`${test_title}`}
	</button>
</div> -->
