<script lang="ts">
import BackIcon from "$lib/icons/BackIcon.svelte"
import ForwardIcon from "$lib/icons/ForwardIcon.svelte"
import FullscreenIcon from "$lib/icons/FullscreenIcon.svelte"
import PauseIcon from "$lib/icons/PauseIcon.svelte"
import PlayIcon from "$lib/icons/PlayIcon.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { format_time } from "$lib/utils/format_time"

interface Props {
	toggle_fullscreen: () => void
	controls_opacity: number
}

let { toggle_fullscreen, controls_opacity = $bindable() }: Props = $props()

let current_time_formatted = $derived(format_time(temp_state.video_current_time))
let current_remaining_time = $derived.by(() => {
	// TODO: Replace 'temp_state.video_playback_speed' with 'temp_state.video_target_playback_speed' once catch-up is implemented
	if (temp_state.video_element?.duration) {
		return format_time(
			(temp_state.video_element.duration - temp_state.video_current_time) / temp_state.video_playback_speed,
		)
	}
	return "0"
})
let total_time = $derived.by(() => {
	if (temp_state.video_element?.duration) {
		return format_time(temp_state.video_element.duration)
	}
	return "0"
})

function local_set_play_pause() {
	if (temp_state.video_state_paused) {
		temp_state.video_element?.play()
		// send_video_play(temp_state.video_current_time)
	} else {
		temp_state.video_element?.pause()
		// send_video_pause(temp_state.video_current_time)
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
        max={temp_state.video_element?.duration}
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