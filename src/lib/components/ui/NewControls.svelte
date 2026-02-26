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
	send_video_seek_to?: (time: number) => void
	toggle_fullscreen: () => void
	controls_opacity: number
	onMouseEnterControls?: () => void
	onMouseLeaveControls?: () => void
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
	toggle_fullscreen,
	controls_opacity = $bindable(),
	onMouseEnterControls = () => {},
	onMouseLeaveControls = () => {},
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

function seek_to_time(new_time: number) {
	temp_state.video_current_time = new_time
	send_video_seek_to(new_time)
}

function seek_forward() {
	seek_to_time(temp_state.video_current_time + 10)
}

function seek_back() {
	seek_to_time(temp_state.video_current_time - 10)
}

let seek_hover_value = $state<string | null>(null)
let seek_hover_percent = $state(0)

function handle_seek_hover(event: MouseEvent) {
	const target = event.currentTarget as HTMLElement
	const rect = target.getBoundingClientRect()

	let percent = (event.clientX - rect.left) / rect.width

	seek_hover_value = format_time(percent * temp_state.video_duration)
	seek_hover_percent = percent * 100
}
</script>

<div
    class="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex gap-2 w-full transition-opacity duration-500"
    style="opacity: {controls_opacity};"
    onpointerenter={onMouseEnterControls}
    onpointerleave={onMouseLeaveControls}>
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
    <div id="current-time" class="text-white select-none text-right min-w-14 max-w-14">{current_time_formatted}</div>
    <div id="time-separator" class="text-white select-none mx-[-2px]">/</div>
    <div id="total-time" class="text-white select-none min-w-14 max-w-14">{total_time}</div>
    <div class="relative w-full mx-8" role="presentation" onmousemove={handle_seek_hover} onmouseleave={() => seek_hover_value = null}>
        <input
            type="range"
            class="w-full "
            min="0"
            max={temp_state.video_duration}
            step="0.01"
            value={temp_state.video_current_time || 0}
            oninput={(e) => {
                // @ts-ignore            
                seek_to_time(Number.parseFloat(e.target.value))
            }}
        />
        {#if seek_hover_value !== null}
            <div
				class="absolute -top-6 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none"
				style="left: {seek_hover_percent}%"
			>
				{seek_hover_value}
			</div>
        {/if}
    </div>
    <div id="remaining-time" class="text-white select-none mr-4 min-w-14 max-w-14 text-right">({current_remaining_time})</div>
    <button class="ml-auto" onclick={toggle_fullscreen}>
        <FullscreenIcon />
    </button>
</div>