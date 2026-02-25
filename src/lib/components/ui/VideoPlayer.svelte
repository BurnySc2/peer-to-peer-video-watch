<script lang="ts">
import { Toaster } from "svelte-5-french-toast"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import NewControls from "./NewControls.svelte"

interface MyProps {
	send_video_seek_to?: (time: number) => void
}

let {
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

function local_video_seek_to(event: Event) {
	if (!event.target) {
		return
	}
	// TODO: After seeking, there should be a pause, but it doesnt work and keeps the old state
	// temp_state.video_element?.pause()
	// @ts-expect-error
	const seek_time: number = event.target.currentTime
	send_video_seek_to(seek_time)
}
function local_can_play(_event: Event) {
	temp_state.video_can_play = true
	console.log("canplay event fired")
}

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
		controls_opacity = 0
	}, 1000) as unknown as number
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={player_container} class="relative w-full h-full" onmousemove={debounce_mouse_move}>
	<Toaster />
	<video bind:this={temp_state.video_element}
		class="w-full h-full"
		muted={false}
		playsinline
		bind:volume={perma_state.global_settings.volume}
		bind:playbackRate={temp_state.video_playback_speed}
		bind:paused={temp_state.video_state_paused}
		bind:currentTime={temp_state.video_current_time}
		src={temp_state.playlist[temp_state.playlist_index]}
		onseeking={local_video_seek_to}
		oncanplay={local_can_play}
	>
		Your browser does not support the video tag.
	</video>
	<NewControls toggle_fullscreen={toggle_fullscreen} bind:controls_opacity={controls_opacity}/>
</div>
