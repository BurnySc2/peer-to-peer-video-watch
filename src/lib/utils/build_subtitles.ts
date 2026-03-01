import { fetch_file_data } from "$lib/utils/fetch_jelly_data"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"


// Returns the external url of a subtitle file
export function get_subs_url(data: JellyfinItem | null) {
    if (!data) return ""
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

    const url = `/Videos/${data.Id}/${data.MediaSources?.[0].Id}/Subtitles/${subs_stream.Index}/Stream.vtt`
    return url
}

export async function load_subtitles(real_url: string) {
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

        if (temp_state.subtitles_blob_url) URL.revokeObjectURL(temp_state.subtitles_blob_url)

        temp_state.subtitles_blob_url = blob_url
    } catch (err) {
        console.error(err)
        if (temp_state.subtitles_blob_url) URL.revokeObjectURL(temp_state.subtitles_blob_url)
        temp_state.subtitles_blob_url = ""
    }
}

export function enable_subtitles() {
    const video = temp_state.video_element
    if (!video) return

    const tracks = video.textTracks
    if (!tracks || tracks.length === 0) return

    for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = "disabled"
    }

    tracks[0].mode = "showing"
}