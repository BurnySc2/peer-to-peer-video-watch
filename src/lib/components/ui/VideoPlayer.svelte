<script lang="ts">
import { untrack } from "svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"

import PlayIcon from "$lib/icons/PlayIcon.svelte"
    import NewControls from "./NewControls.svelte";

interface MyProps {
	send_video_seek_to?: (time: number) => void
}

let {
	send_video_seek_to = (time: number) => {
		console.log("Sending video_seek_to", time)
	},
}: MyProps = $props()

// let video_element = $state<HTMLVideoElement>()

let player_container: HTMLDivElement | null = null

function full_screen_toggle() {
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
</script>

<div bind:this={player_container} class="relative w-full h-full">
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
	<NewControls onFullscreen={full_screen_toggle}/>

</div>
