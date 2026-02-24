<script lang="ts">
import { untrack } from "svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { type TMessage } from "$lib/types/peer_to_peer"

interface MyProps {
	send_video_play?: (message: TMessage) => void
	send_video_pause?: (message: TMessage) => void
	send_video_seek_to?: (message: TMessage) => void
}

let {
	send_video_play = (message: TMessage) => {
		console.log("Sending video_play", message)
	},
	send_video_pause = (message: TMessage) => {
		console.log("Sending video_pause", message)
	},
	send_video_seek_to = (message: TMessage) => {
		console.log("Sending video_seek_to", message)
	},
}: MyProps = $props()

let video_element = $state<HTMLVideoElement>()

function local_video_play() {
	temp_state.video_state_paused = false
	send_video_play({ type: "video_play", time: untrack(() => temp_state.video_current_time) })
}
function local_video_pause() {
	temp_state.video_state_paused = true
	send_video_pause({ type: "video_pause", time: untrack(() => temp_state.video_current_time) })
}
function local_video_seek_to(event: Event) {
	if (!event.target) {
		return
	}
	// @ts-expect-error
	const seek_time: number = event.target.currentTime
	temp_state.video_state_paused = true
	send_video_seek_to({ type: "video_seek_to", time: seek_time })
}
function local_can_play(_event: Event) {
	temp_state.video_can_play = true
	console.log("canplay event fired")
}

// Watch pause/play
$effect(() => {
	if (!video_element) {
		return
	}
	if (temp_state.video_state_paused) {
		local_video_pause()
	} else {
		local_video_play()
	}
})
</script>

<video bind:this={video_element}
	class="w-full h-full"
	controls
	muted={true}
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
