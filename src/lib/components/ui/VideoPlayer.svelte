<script lang="ts">
import { onMount } from "svelte"
import { Toaster } from "svelte-5-french-toast"
import { p2p_send_playlist_set, p2p_send_ready_check } from "$lib/peer_handling/peer_send.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { peer_count, temp_state } from "$lib/temporary-storage.svelte"
import type { SubtitleItem } from "$lib/types/subtitle_item"
import { get_progress_for_item_id, update_progress_for_item_id } from "$lib/utils/fetch_jelly_data"
import { handle_load_subtitles } from "$lib/utils/subtitles_fetching"
import { reset_subtitle_state, update_current_subtitle } from "$lib/utils/subtitles_parsing"
import NewControls from "./NewControls.svelte"
import ReadyCheck from "./ReadyCheck.svelte"
import Sleeping from "./Sleeping.svelte"
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
let mouse_location = $state<"inside" | "outside">("outside")
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

    // Mouse is inside the div
    show_mouse()
    mouse_location = "inside"

    // Set a timeout to hide controls after 3 seconds
    hide_timeout = setTimeout(() => {
        if (!mouse_in_controls) {
            controls_opacity = 0
            if (mouse_location === "inside") {
                document.body.style.cursor = "none"
            }
        }
    }, 1000) as unknown as number
}

function show_mouse() {
    // Mouse has been moved or left the div
    mouse_location = "outside"
    document.body.style.cursor = "default"
}

let subtitles = $state<SubtitleItem[]>([])
let subtitle_text = $state("")
async function handle_subtitle_update() {
    // No subtitle original url
    if (!temp_state.playlist[temp_state.playlist_index].subtitles_original_url) {
        return
    }
    // Build blob url and parse subtitles, if not loaded already
    if (!temp_state.subtitles.active_url) {
        subtitles = await handle_load_subtitles()
    }
    const new_text = update_current_subtitle($state.snapshot(subtitles))
    if (new_text !== subtitle_text) {
        subtitle_text = new_text
    }
}

async function handle_video_loaded() {
    // Video change resets playbackspeed, which is bindable to temp_state.video_playback_speed
    temp_state.video_playback_speed = temp_state.video_target_playback_speed
    // Reset catch up
    temp_state.video_p2p_max_time = 0
    temp_state.is_catching_up = false

    // Restore playback progress for solo watching
    if (!peer_count()) {
        const progress = await get_progress_for_item_id(temp_state.playlist[temp_state.playlist_index].url)
        if (progress !== null && progress > 0 && temp_state.video_element) {
            temp_state.video_element.currentTime = progress * temp_state.video_duration
        }
    }

    // Actions for autoplay
    // When video is loaded, if in group send ready check, if solo just play
    if (temp_state.autoplay) {
        if (peer_count()) {
            p2p_send_ready_check()
        } else {
            temp_state.video_state_paused = false
        }
    }

    // Reset subtitles
    subtitle_text = ""
    reset_subtitle_state()

    subtitles = await handle_load_subtitles()
}

// Autoplay handling
function handle_video_end() {
    // In jellyfin, mark the video as "watched" when watching solo
    if (!peer_count()) {
        update_progress_for_item_id(temp_state.playlist[temp_state.playlist_index].url, 1, 0)
    }

    if (!temp_state.autoplay) {
        return
    }

    if (temp_state.playlist_index + 1 >= temp_state.playlist.length) {
        return
    }

    // Autoplay below
    temp_state.playlist_index += 1
    p2p_send_playlist_set({ playlist: temp_state.playlist, playlist_index: temp_state.playlist_index })
}

onMount(() => {
    // Update progress to jellyfin if watching solo
    const timer_update_jellyfin_progress = setInterval(() => {
        if (temp_state.video_element === null || peer_count()) {
            return
        }
        const progress = temp_state.video_current_time / temp_state.video_duration
        if (progress < 0.9 && !temp_state.video_state_paused) {
            update_progress_for_item_id(
                temp_state.playlist[temp_state.playlist_index].url,
                progress,
                temp_state.video_current_time,
            )
        }
    }, 30_000)

    return () => {
        clearInterval(timer_update_jellyfin_progress)
    }
})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={player_container}
    class="relative flex w-full h-full"
    onmouseleave={show_mouse}
    onmousemove={debounce_mouse_move}
    onscroll={debounce_mouse_move}
    onpointerdown={debounce_mouse_move}
>
    {#if temp_state.playlist_index === -1}
        <div class="p-6 w-full text-center text-xl">Enter a link below to begin...</div>
    {:else}
        {#if temp_state.is_sleeping}
            <Sleeping />
        {:else}
            <Toaster />
            <video
                bind:this={temp_state.video_element}
                class="flex w-full max-h-screen bg-black"
                muted={false}
                playsinline
                ontimeupdate={handle_subtitle_update}
                onloadeddata={handle_video_loaded}
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
        {/if}
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
