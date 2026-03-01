<script lang="ts">
import { Toaster } from "svelte-5-french-toast"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { extract_subtitle_url, fetch_file_data } from "$lib/utils/fetch_jelly_data"
import NewControls from "./NewControls.svelte"
import ReadyCheck from "./ReadyCheck.svelte"

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

async function get_subs_url() {
    const url = new URL(temp_state.playlist[temp_state.playlist_index].url)
    const data = await fetch_file_data(temp_state.playlist[temp_state.playlist_index].url)
    console.log(data)

    const subs_path = extract_subtitle_url(data)
    if (!subs_path) {
        console.log("No subs path found")
        return null
    }
    const real_url = url.origin + subs_path
    console.log(real_url)
    return real_url
}

let subs_url = $state("")
async function load_subtitles() {
    const real_url = await get_subs_url()
    if (!real_url) return

    try {
        const res = await fetch(real_url, {
            credentials: "include", // if needed
        })

        if (!res.ok) throw new Error("Failed to fetch subtitles")

        const text = await res.text()

        // Ensure it's proper VTT
        const vtt_text = text.startsWith("WEBVTT") ? text : "WEBVTT\n\n" + text

        const blob = new Blob([vtt_text], { type: "text/vtt" })
        const blob_url = URL.createObjectURL(blob)

        if (subs_url) URL.revokeObjectURL(subs_url)

        subs_url = blob_url
        console.log(subs_url)
    } catch (err) {
        console.error(err)
        subs_url = ""
    }
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={player_container}
    class="relative w-10/12 h-10/12"
    onmousemove={debounce_mouse_move}
    onpointerdown={debounce_mouse_move}
>
    {#if temp_state.playlist[temp_state.playlist_index] === undefined}
        <div class="p-6 w-full text-center text-xl">Enter a link below to begin.</div>
    {:else}
        <Toaster />
        <video
            bind:this={temp_state.video_element}
            controls
            class="flex w-full h-full"
            muted={false}
            playsinline
            bind:volume={perma_state.global_settings.volume}
            bind:playbackRate={temp_state.video_playback_speed}
            bind:paused={temp_state.video_state_paused}
            bind:currentTime={temp_state.video_current_time}
            bind:duration={temp_state.video_duration}
            src={temp_state.playlist[temp_state.playlist_index].url}
            oncanplay={local_can_play}
        >
            {#if subs_url}
                {#key subs_url}
                    <track
                        kind="subtitles"
                        src={subs_url}
                        srclang="en"
                        label="English"
                        default
                    >
                {/key}
            {/if}
            Your browser does not support the video tag.
        </video>
        <ReadyCheck {send_video_play} />
    <!-- <NewControls
            {send_video_play}
            {send_video_pause}
            {send_video_seek_to}
            {toggle_fullscreen}
            bind:controls_opacity
            onMouseEnterControls={() => (mouse_in_controls = true)}
            onMouseLeaveControls={() => (mouse_in_controls = false)}
        /> -->
    {/if}
</div>
<button onclick={load_subtitles}>Subs</button>
