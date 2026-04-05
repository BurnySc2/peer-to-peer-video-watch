<script lang="ts">
import BackIcon from "$lib/icons/BackIcon.svelte"
import ForwardIcon from "$lib/icons/ForwardIcon.svelte"
import FullscreenIcon from "$lib/icons/FullscreenIcon.svelte"
import PauseIcon from "$lib/icons/PauseIcon.svelte"
import PlayIcon from "$lib/icons/PlayIcon.svelte"
import { p2p_send_ready_check } from "$lib/peer_handling/peer_send.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { format_time } from "$lib/utils/format_time"
import Emotes from "./Emotes.svelte"

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
    format_time((temp_state.video_duration - temp_state.video_current_time) / temp_state.video_target_playback_speed),
)
let total_time = $derived(format_time(temp_state.video_duration))

function local_set_play_pause() {
    if (temp_state.video_state_paused) {
        temp_state.video_state_paused = false
        temp_state.is_sleeping = false
        send_video_play(temp_state.video_current_time)
    } else {
        temp_state.video_state_paused = true
        send_video_pause(temp_state.video_current_time)
    }
}

function seek_to_time(new_time: number) {
    if (new_time < 0) {
        new_time = 0
    }
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

function toggle_subtitles() {
    const tracks = temp_state.video_element?.textTracks
    if (!tracks || tracks.length === 0) {
        return
    }

    temp_state.subtitles.enabled = !temp_state.subtitles.enabled

    tracks[0].mode = temp_state.subtitles.enabled ? "showing" : "disabled"
}

function toggle_custom_subtitles() {
    temp_state.subtitles.enabled = !temp_state.subtitles.enabled
    console.log("Subtitles enabled:", temp_state.subtitles.enabled)
}
</script>

{#if temp_state.playlist[temp_state.playlist_index]?.video_title}
    <div
        class="absolute top-0 left-0 p-2 bg-black/50 rounded-br-xl text-xl transition-opacity duration-500"
        style="opacity: {controls_opacity};"
    >
        {temp_state.playlist[temp_state.playlist_index].video_title}
    </div>
{/if}
<Emotes
    {controls_opacity}
    {onMouseEnterControls}
    {onMouseLeaveControls}
/>
<div
    role="toolbar"
    aria-label="Video playback controls"
    tabindex="0"
    class="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex gap-2 w-full transition-opacity duration-500"
    style="opacity: {controls_opacity};"
    onpointerenter={onMouseEnterControls}
    onpointerleave={onMouseLeaveControls}
>
    <button
        class="hover:text-blue-400 hover:scale-130 transition"
        onclick={local_set_play_pause}
        aria-label={temp_state.video_state_paused ? "Play" : "Pause"}
        data-testid={temp_state.video_state_paused ? "player-play" : "player-pause"}
    >
        {#if temp_state.video_state_paused}
            <PlayIcon />
        {:else}
            <PauseIcon />
        {/if}
    </button>
    <button
        class="hover:text-blue-400 hover:scale-130 transition"
        onclick={seek_back}
        aria-label="Seek back"
        data-testid="seek-back"
    >
        <BackIcon />
    </button>
    <button
        class="hover:text-blue-400 hover:scale-130 transition"
        onclick={seek_forward}
        aria-label="Seek forward"
        data-testid="seek-forward"
    >
        <ForwardIcon />
    </button>
    <div
        id="current-time"
        class="select-none text-right min-w-14 max-w-14"
        data-testid="current-time"
    >
        {current_time_formatted}
    </div>
    <div
        id="time-separator"
        class="select-none -mx-0.5"
    >
        /
    </div>
    <div
        id="total-time"
        class="select-none min-w-14 max-w-14"
        data-testid="total-time"
    >
        {total_time}
    </div>
    <div
        class="relative w-full mx-8"
        role="presentation"
        onmousemove={handle_seek_hover}
        onmouseleave={() => seek_hover_value = null}
    >
        <input
            type="range"
            data-testid="seek-slider"
            class="w-full"
            min="0"
            max={temp_state.video_duration}
            step="0.01"
            value={temp_state.video_current_time || 0}
            oninput={(e) => {
                const value = seek_hover_percent > 0
                    ? temp_state.video_duration * seek_hover_percent/100
                    : (e.target as HTMLInputElement).valueAsNumber

                seek_to_time(value)
            }}
        >
        {#if seek_hover_value !== null}
            <div
                class="absolute -top-6 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded pointer-events-none"
                style="left: {seek_hover_percent}%"
            >
                {seek_hover_value}
            </div>
        {/if}
    </div>
    <div
        id="remaining-time"
        class="select-none mr-4 min-w-14 max-w-14 text-right"
        aria-label="Remaining time"
        data-testid="remaining-time"
    >
        ({current_remaining_time})
    </div>
    <button
        class={`ml-auto ${temp_state.subtitles.enabled ? "text-blue-400": "text-white"} hover:scale-130 transition`}
        onclick={toggle_custom_subtitles}
        aria-label="Closed captions"
        data-testid="closed-captions"
    >
        CC
    </button>
    <button
        class="ml-auto hover:text-blue-400 hover:scale-130 transition"
        title={`Peers: ${Object.keys(temp_state.peer_connections).length}`}
        onclick={p2p_send_ready_check}
        aria-label="Ready check"
        data-testid="ready-check"
    >
        R
    </button>
    <button
        class="ml-auto hover:text-blue-400 hover:scale-130 transition"
        onclick={toggle_fullscreen}
        aria-label="Fullscreen"
        data-testid="fullscreen"
    >
        <FullscreenIcon />
    </button>
</div>
