<script lang="ts">
import { onDestroy, onMount } from "svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { SubtitleItem } from "$lib/types/subtitle_item"

interface Props {
    subtitles: SubtitleItem[]
}

let { subtitles }: Props = $props()

let current_subtitle_id = $state<number | null>(null)
let current_text = $state("")
let curr_subtitle_start: number | null = null
let curr_subtitle_end: number | null = null

let next_subtitle_start: number | null = null
let next_subtitle_end: number | null = null

function initialise_subtitles() {
    for (let i = 0; i <= subtitles.length; i++) {
        const sub = subtitles[i]
        if (temp_state.video_current_time + temp_state.subtitles_offset <= sub.end_s) {
            current_subtitle_id = i
            break
        }
    }
    if (current_subtitle_id === null) current_subtitle_id = 0
    curr_subtitle_start = subtitles[current_subtitle_id].start_s
    curr_subtitle_end = subtitles[current_subtitle_id].end_s

    next_subtitle_start = subtitles[current_subtitle_id + 1]?.start_s
    next_subtitle_end = subtitles[current_subtitle_id + 1]?.end_s
}

let prev_vid_time: null | number = null
function update_current_subtitle() {
    if (!subtitles.length) return

    if (current_subtitle_id === null) initialise_subtitles()

    if (current_subtitle_id === null || !curr_subtitle_end) {
        current_text = ""
        return
    }

    if (prev_vid_time === null) prev_vid_time = temp_state.video_current_time

    // We are at an unexpected playback point, possibly due to seeking, so reset.
    if (Math.abs(prev_vid_time - temp_state.video_current_time) > 10) {
        prev_vid_time = null
        initialise_subtitles()
        return
    }
    prev_vid_time = temp_state.video_current_time

    const current_time_with_offset = temp_state.video_current_time + temp_state.subtitles_offset
    // console.log(`offset: ${temp_state.subtitles_offset}, curr_offset_time: ${current_time_with_offset}, ends at ${curr_subtitle_end}`)

    if (current_time_with_offset > curr_subtitle_end) {
        // console.log("Next sub triggered")
        current_subtitle_id += 1
        curr_subtitle_start = next_subtitle_start
        curr_subtitle_end = next_subtitle_end

        next_subtitle_start = subtitles[current_subtitle_id + 1]?.start_s
        next_subtitle_end = subtitles[current_subtitle_id + 1]?.end_s
    }

    if (!curr_subtitle_start || !curr_subtitle_end) {
        current_text = ""
        return
    }
    if (curr_subtitle_start <= current_time_with_offset && current_time_with_offset <= curr_subtitle_end) {
        current_text = subtitles[current_subtitle_id].text
    } else current_text = ""
}

let interval: ReturnType<typeof setInterval>
onMount(() => {
    // Update subtitles every 250ms (adjust as needed)
    interval = setInterval(() => {
        update_current_subtitle()
    }, 1000)
})

onDestroy(() => {
    clearInterval(interval)
})
</script>

{#if current_text && temp_state.subtitles_enabled}
    <div class="absolute bottom-10 left-0 w-full text-center pointer-events-none">
        <div class="inline-block p-2 bg-black/70 rounded-lg">{current_text}</div>
    </div>
{/if}
