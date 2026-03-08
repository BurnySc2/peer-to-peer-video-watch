import { tick } from "svelte"
import { APP_CONFIG } from "$lib/config"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"

// Returns the external url of a subtitle file
export function get_subs_url(data: JellyfinItem | null) {
    if (!data) return ""
    if (!temp_state.playlist[temp_state.playlist_index]) return ""
    const url = new URL(temp_state.playlist[temp_state.playlist_index].url)
    if (!url.toString().includes("vodching")) return null

    const subs_path = extract_subtitle_path(data)
    if (!subs_path) {
        console.log("No subs path found")
        return null
    }
    const real_url = url.origin + subs_path
    return real_url
}

// Build the path part of the subtitle url
function extract_subtitle_path(data: JellyfinItem) {
    if (!data?.Id) return null

    const media_source = data.MediaSources?.[0]
    if (!media_source) return null

    const subs_stream = media_source.MediaStreams?.find((stream) => stream.IsTextSubtitleStream === true)
    if (!subs_stream) return null

    const url = `/Videos/${data.Id}/${data.MediaSources?.[0].Id}/Subtitles/${subs_stream.Index}/Stream.srt`
    return url
}

export async function build_subtitles_blob(real_url: string) {
    if (!real_url) return

    try {
        const res = await fetch(real_url)

        if (!res.ok) throw new Error("Failed to fetch subtitles")

        const text = await res.text()

        // Ensure it's proper VTT
        // const vtt_text = text.startsWith("WEBVTT") ? text : "WEBVTT\n\n" + text

        const blob = new Blob([text], { type: "text/srt" })
        const blob_url = URL.createObjectURL(blob)

        if (temp_state.subtitles.blob_url) URL.revokeObjectURL(temp_state.subtitles.blob_url)

        temp_state.subtitles.blob_url = blob_url
        console.log("load_subtitles success")
    } catch (err) {
        console.error(err)
        if (temp_state.subtitles.blob_url) URL.revokeObjectURL(temp_state.subtitles.blob_url)
        temp_state.subtitles.blob_url = ""
    }
}

export async function load_subtitles_from_blob() {
    if (temp_state.subtitles.blob_url) {
        URL.revokeObjectURL(temp_state.subtitles.blob_url)
    }
    temp_state.subtitles.blob_url = ""
    console.log("Sub blob cleared ", temp_state.subtitles.blob_url)

    const subtitles_original_url = temp_state.playlist[temp_state.playlist_index]?.subtitles_original_url
    if (!subtitles_original_url) {
        console.log("No subtitles_original_url found")
        return
    }

    console.log("Subtitle load attempt - ", subtitles_original_url)
    await build_subtitles_blob(subtitles_original_url)
    await tick()
}

export function enable_subtitles() {
    const video = temp_state.video_element
    if (!video) return

    const tracks = video.textTracks
    if (!tracks || tracks.length === 0) return

    for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = "disabled"
    }

    if (APP_CONFIG.subtitles_default_on) tracks[0].mode = "showing"
}
