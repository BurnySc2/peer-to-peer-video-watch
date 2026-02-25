<script lang="ts">
import BackIcon from "$lib/icons/BackIcon.svelte"
import ForwardIcon from "$lib/icons/ForwardIcon.svelte"
import FullscreenIcon from "$lib/icons/FullscreenIcon.svelte"
import PauseIcon from "$lib/icons/PauseIcon.svelte"
import PlayIcon from "$lib/icons/PlayIcon.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { format_time } from "$lib/utils/format_time"

interface Props {
	send_video_play?: (time: number) => void
	send_video_pause?: (time: number) => void
	toggle_fullscreen: () => void
	controls_opacity: number
}

let {
	send_video_play = (time: number) => {
		console.log("Sending video_play", time)
	},
	send_video_pause = (time: number) => {
		console.log("Sending video_pause", time)
	},
	toggle_fullscreen,
	controls_opacity = $bindable(),
}: Props = $props()

let current_time_formatted = $derived(format_time(temp_state.video_current_time))
let current_remaining_time = $derived(
	format_time((temp_state.video_duration - temp_state.video_current_time) / temp_state.video_playback_speed),
)
let total_time = $derived(format_time(temp_state.video_duration))

function local_set_play_pause() {
	if (temp_state.video_state_paused) {
		temp_state.video_state_paused = false
		send_video_play(temp_state.video_current_time)
	} else {
		temp_state.video_state_paused = true
		send_video_pause(temp_state.video_current_time)
	}
}

function seek_forward() {
	temp_state.video_current_time += 10
}

function seek_back() {
	temp_state.video_current_time -= 10
}
</script>

<div class="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex gap-2 w-full transition-opacity duration-500" style="opacity: {controls_opacity};">
    <button onclick={local_set_play_pause}>
        {#if temp_state.video_state_paused}
        <PlayIcon />
        {:else}
        <PauseIcon />
        {/if}
    </button>
    <button onclick={seek_back}>
        <BackIcon />
    </button>
    <button onclick={seek_forward}>
        <ForwardIcon />
    </button>
    <div id="current-time" class="text-white select-none min-w-14 max-w-14">{current_time_formatted}</div>
    <input
        type="range"
        class="w-full mx-8"
        min="0"
        max={temp_state.video_duration}
        step="0.01"
        value={temp_state.video_current_time || 0}
        oninput={(e) => {
            // @ts-ignore
            temp_state.video_current_time = e.target.value
        }}
    />
    <div id="remaining-time" class="text-white select-none min-w-14 max-w-14 text-right">{current_remaining_time}</div>
    <div id="time-separator" class="text-white select-none mx-[-8px]">|</div>
    <div id="total-time" class="text-white select-none min-w-14 max-w-14">{total_time}</div>
    <button class="ml-auto" onclick={toggle_fullscreen}>
        <FullscreenIcon />
    </button>
</div>