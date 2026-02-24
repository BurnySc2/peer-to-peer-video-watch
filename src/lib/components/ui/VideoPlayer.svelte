<script lang="ts">
import { temp_state } from "$lib/temporary-storage.svelte"
import { type TMessage } from "$lib/types/peer_to_peer"

interface MyProps {
	send_playlist_set_current_playing: (message: TMessage) => void
	send_video_play: (message: TMessage) => void
	send_video_pause: (message: TMessage) => void
	send_video_seek_to: (message: TMessage) => void
	// TODO: Will be set outside the player
	// send_video_set_playback_rate: (message: TMessage) => void
}

let {
	send_playlist_set_current_playing = (message: TMessage) => {
		console.log("Sending playlist_set_current_playing", message)
	},
	send_video_play = (message: TMessage) => {
		console.log("Sending video_play", message)
	},
	send_video_pause = (message: TMessage) => {
		console.log("Sending video_pause", message)
	},
	send_video_seek_to = (message: TMessage) => {
		console.log("Sending video_seek_to", message)
	},
	// send_video_set_playback_rate = (message: TMessage) => {
	// 	console.log("Sending video_set_playback_rate", message)
	// },
}: MyProps = $props()

let video_element = $state<HTMLVideoElement>()

function local_playlist_set_current_playing(index: number) {
	send_playlist_set_current_playing({ type: "playlist_set_current_playing", value: index })
}
function local_video_play() {
	temp_state.video_state = "playing"
	send_video_play({ type: "video_play", time: temp_state.video_current_time })
}
function local_video_pause() {
	temp_state.video_state = "paused"
	send_video_pause({ type: "video_pause", time: temp_state.video_current_time })
}
function local_video_seek_to(_event: Event) {
	temp_state.video_state = "playing"
	send_video_seek_to({ type: "video_seek_to", time: temp_state.video_current_time })
}
// function local_video_set_playback_rate(rate: number) {
// 	temp_state.video_state = "playing"
// 	send_video_set_playback_rate({ type: "video_set_playback_rate", value: rate, time: temp_state.video_current_time })
// }

// Watch pause/play
$effect(() => {
	if (!video_element) {
		return
	}
	if (video_element.paused) {
		local_video_pause()
	} else {
		local_video_play()
	}
})
</script>

<div>
    <!-- TODO: Video player using temp_store values -->
	<video bind:this={video_element}
		controls
		muted
		playsinline
		bind:playbackRate={temp_state.video_playback_speed}
		onseeking={local_video_seek_to}
		src={temp_state.playlist[temp_state.playlist_index]}
		class="max-h-[75vh]"
	>
		Your browser does not support the video tag.
	</video>
</div>
