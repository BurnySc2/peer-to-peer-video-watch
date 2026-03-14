import { temp_state } from "$lib/temporary-storage.svelte"
import type { SubtitleItem } from "$lib/types/subtitle_item"

export function parse_srt(raw_text: string): SubtitleItem[] {
    const normalised_text = raw_text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/^\uFEFF/, "")

    const subtitles: SubtitleItem[] = []
    const blocks = normalised_text.trim().split(/\n{2,}/)
    blocks.forEach((item) => {
        const pieces = item.split("\n")

        if (pieces.length < 2) {
            return
        }

        const [start_time, end_time] = pieces[1].split("-->")

        if (!start_time || !end_time) {
            return
        }

        subtitles.push({
            id: pieces[0].trim(),
            start_s: srt_time_to_s(start_time.trim()),
            end_s: srt_time_to_s(end_time.trim()),
            text: pieces
                .slice(2)
                .join("\n")
                .trim()
                .replace(/\{\\an8\}/g, ""),
        })
    })

    console.log(subtitles)
    return subtitles
}

export function srt_time_to_s(timestamp: string): number {
    const match = timestamp.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/)

    if (!match) {
        throw new Error(`Invalid SRT timestamp: ${timestamp}`)
    }

    const [, hours, minutes, seconds, milliseconds] = match

    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) * 0.001
}

let current_subtitle_id: null | number = null
let current_text = ""
let curr_subtitle_start: number | null = null
let curr_subtitle_end: number | null = null

let next_subtitle_start: number | null = null
let next_subtitle_end: number | null = null

function initialise_subtitles(subtitles: SubtitleItem[]) {
    for (let i = 0; i <= subtitles.length; i++) {
        const sub = subtitles[i]
        if (temp_state.video_current_time + temp_state.subtitles.offset <= sub.end_s) {
            current_subtitle_id = i
            break
        }
    }
    if (current_subtitle_id === null) {
        current_subtitle_id = 0
    }
    curr_subtitle_start = subtitles[current_subtitle_id].start_s
    curr_subtitle_end = subtitles[current_subtitle_id].end_s

    next_subtitle_start = subtitles[current_subtitle_id + 1]?.start_s
    next_subtitle_end = subtitles[current_subtitle_id + 1]?.end_s
}

let prev_vid_time: null | number = null
export function update_current_subtitle(subtitles: null | SubtitleItem[] = null): string {
    if (!subtitles || !subtitles.length) {
        return ""
    }

    if (current_subtitle_id === null) {
        initialise_subtitles(subtitles)
    }

    if (current_subtitle_id === null || !curr_subtitle_end) {
        current_text = ""
        return ""
    }

    if (prev_vid_time === null) {
        prev_vid_time = temp_state.video_current_time
    }

    // We are at an unexpected playback point, possibly due to seeking, so reset.
    if (Math.abs(prev_vid_time - temp_state.video_current_time) > 5) {
        prev_vid_time = null
        initialise_subtitles(subtitles)
        return ""
    }
    prev_vid_time = temp_state.video_current_time

    const current_time_with_offset = temp_state.video_current_time + temp_state.subtitles.offset
    // console.log(`offset: ${temp_state.subtitles.offset}, curr_offset_time: ${current_time_with_offset}, ends at ${curr_subtitle_end}`)

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
        return ""
    }
    if (curr_subtitle_start <= current_time_with_offset && current_time_with_offset <= curr_subtitle_end) {
        current_text = subtitles[current_subtitle_id].text
    } else {
        current_text = ""
    }
    return current_text
}
