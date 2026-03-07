<script lang="ts">
import { Toaster } from "svelte-5-french-toast"
import { p2p_send_playlist_set } from "$lib/peer_handling/peer_send.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { SubtitleItem } from "$lib/types/subtitle_item"
import { load_subtitles_from_blob } from "$lib/utils/build_subtitles"
import { fetch_srt_from_url, parse_srt, update_current_subtitle } from "$lib/utils/custom_subtitles"
import NewControls from "./NewControls.svelte"
import ReadyCheck from "./ReadyCheck.svelte"
import Subtitles from "./Subtitles.svelte"

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

let subtitles = $state<SubtitleItem[]>([])
async function handle_load_subtitles() {
    subtitles = []
    await load_subtitles_from_blob()
    if (temp_state.subtitles.blob_url) {
        const raw_srt_text = await fetch_srt_from_url(temp_state.subtitles.blob_url)
        subtitles = parse_srt(raw_srt_text)
        console.log("Subtitles loaded ", temp_state.subtitles.blob_url)
    } else console.log("Subtitles not loaded")
}

let last_sub_url = ""
$effect(() => {
    const url = temp_state.playlist[temp_state.playlist_index]?.subtitles_original_url
    if (url === last_sub_url) return

    last_sub_url = url
    handle_load_subtitles()
})

let subtitle_text = $state("")
function handle_subtitle_update() {
    const new_text = update_current_subtitle(subtitles)
    if (new_text !== subtitle_text) {
        subtitle_text = new_text
    }
}

function handle_video_end() {
    if (!temp_state.autoplay) {
        return
    }

    if (temp_state.playlist_index + 1 >= temp_state.playlist.length) {
        return
    }

    temp_state.playlist_index += 1
    p2p_send_playlist_set({ playlist: temp_state.playlist, playlist_index: temp_state.playlist_index })

    if (!temp_state.peer_connections.length) {
        setTimeout(() => {
            temp_state.video_state_paused = false
        }, 1000)
    }
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={player_container}
    class="relative w-10/12 h-10/12"
    onmousemove={debounce_mouse_move}
    onscroll={debounce_mouse_move}
    onpointerdown={debounce_mouse_move}
>
    {#if temp_state.playlist[temp_state.playlist_index] === undefined}
        <div class="p-6 w-full text-center text-xl">Enter a link below to begin...</div>
    {:else}
        <Toaster />
        <video
            bind:this={temp_state.video_element}
            class="flex w-full h-full"
            muted={false}
            playsinline
            ontimeupdate={handle_subtitle_update}
            bind:volume={perma_state.global_settings.volume}
            bind:playbackRate={temp_state.video_playback_speed}
            bind:paused={temp_state.video_state_paused}
            bind:currentTime={temp_state.video_current_time}
            bind:duration={temp_state.video_duration}
            src={temp_state.playlist[temp_state.playlist_index].url}
            oncanplay={local_can_play}
            onended={handle_video_end}
        >
            Your browser does not support the video tag.
        </video>
        <ReadyCheck {send_video_play} />
        <Subtitles
            {subtitle_text}
            enabled={temp_state.subtitles.enabled}
        />
        <NewControls
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
