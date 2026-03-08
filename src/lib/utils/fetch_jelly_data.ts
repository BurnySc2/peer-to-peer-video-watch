import type { TPlayListItem } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"
import { get_search_params } from "./url_utils"

export function extract_title(data: JellyfinItem | null) {
    if (!data) {
        return null
    }

    // A non-detected jellyfin series
    if (data.SeriesName && !data.ParentIndexNumber && !data.IndexNumber && data.MediaSources?.length === 1) {
        return data.MediaSources[0].Name
    }

    let video_title = ""
    if (data.SeriesName) {
        video_title = `${data.SeriesName} - S${data.ParentIndexNumber ?? "?"}:E${data.IndexNumber ?? "?"} - ${data.Name ?? "Untitled"}`
    } else {
        video_title = data.Name ?? ""
    }
    if (video_title !== "" && data.ProductionYear) {
        video_title += ` (${data.ProductionYear})`
    }
    return video_title
}

// Fetch video title (for Jellyfin links only)
export async function fetch_file_data(url: string) {
    if (!url.includes("vodching")) {
        return null
    }
    url = url.replace("/Download", "")
    try {
        const res = await fetch(url)
        const data: JellyfinItem = await res.json()
        return data
    } catch (err) {
        console.warn("Metadata fetch failed:", err)
    }
    return null
}

export async function fetch_season_data(url: string, series_id: string, season_id: string | null) {
    const [url_data, params] = get_search_params(url)
    const season_param = season_id !== null ? `season_Id=${season_id}&` : ""
    const api_url = `${url_data.origin}/Shows/${series_id}/Episodes?${season_param}sortBy=IndexNumber&api_key=${params.api_key}`

    try {
        const res = await fetch(api_url)
        // TODO: Add types
        const data = await res.json()
        const data_mapped: TPlayListItem[] = data.Items.map((item) => {
            return {
                url: `${url_data.origin}/Items/${item.Id}/Download?api_key=${params.api_key}`,
                video_title: "",
                subtitles_original_url: "",
            } as TPlayListItem
        })
        return data_mapped
    } catch (err) {
        console.warn("Metadata fetch failed:", err)
    }
    return []
}
