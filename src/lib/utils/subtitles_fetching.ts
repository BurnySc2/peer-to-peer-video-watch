import { temp_state } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"
import type { SubtitleItem } from "$lib/types/subtitle_item"
import { parse_srt } from "./subtitles_parsing"

// Returns the external url of a subtitle file
export function get_subs_url(url: string, data: JellyfinItem | null) {
    if (!data) {
        return null
    }
    if (!data.HasSubtitles) {
        return null
    }
    const subs_path = extract_subtitle_path(data)
    if (!subs_path) {
        console.log("No subs path found")
        return null
    }
    const base_url = new URL(url)
    const real_url = base_url.origin + subs_path
    return real_url
}

// Build the path part of the subtitle url
function extract_subtitle_path(data: JellyfinItem) {
    if (!data?.Id) {
        return null
    }

    const media_source = data.MediaSources?.[0]
    if (!media_source) {
        return null
    }

    const subs_stream = media_source.MediaStreams?.find((stream) => stream.IsTextSubtitleStream === true)
    if (!subs_stream) {
        return null
    }

    const url = `/Videos/${data.Id}/${data.MediaSources?.[0].Id}/Subtitles/${subs_stream.Index}/Stream.srt`
    return url
}

export async function fetch_srt_from_url(url: string): Promise<string> {
    const res = await fetch(url)
    const raw_text = await res.text()
    return raw_text || ""
}

export async function handle_load_subtitles(): Promise<SubtitleItem[]> {
    const subtitles_original_url = temp_state.playlist[temp_state.playlist_index]?.subtitles_original_url
    temp_state.subtitles.active_url = subtitles_original_url
    if (subtitles_original_url) {
        const raw_srt_text = await fetch_srt_from_url(subtitles_original_url)
        console.log("Subtitles loaded ", subtitles_original_url)
        return parse_srt(raw_srt_text)
    } else {
        console.log("Subtitles not loaded")
    }
    return []
}
