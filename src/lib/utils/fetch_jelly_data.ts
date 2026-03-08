import type { TPlayListItem } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"
import { get_search_params } from "./url_utils"

export function extract_title(data: JellyfinItem | null) {
    if (!data) {
        return null
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
let last_url = "" // Prevent issue: quickly changing videos -> incorrect name
export async function fetch_file_data(url: string) {
    if (!url.includes("vodching")) {
        return null
    }

    url = url.replace("/Download", "")
    last_url = url
    try {
        const res = await fetch(url)
        const data: JellyfinItem = await res.json()

        if (url === last_url) {
            return data
        }
    } catch (err) {
        console.warn("Metadata fetch failed:", err)
    }
    if (url !== last_url) {
        console.warn("Title overwrite possible")
    }
    return null
}

export async function fetch_season_data(url: string, series_id: string, season_id: string) {
    const [url_data, params] = get_search_params(url)
    console.log(url_data)

    const api_url = `${url_data.origin}/Shows/${series_id}/Episodes?seasonId=${season_id}&sortBy=IndexNumber&api_key=${params.api_key}`
    console.log(api_url)

    try {
        const res = await fetch(api_url)
        // TODO: Add types
        const data = await res.json()
        console.log(data)

        const data_mapped: TPlayListItem[] = data.Items.map((item) => {
            return {
                url: `${url_data.origin}/Items/${item.Id}/Download?api_key=${params.api_key}`,
                video_title: "",
                subtitles_original_url: "",
            }
        })
        console.log(data)
        console.log(data_mapped)

        return data_mapped
    } catch (err) {
        console.warn("Metadata fetch failed:", err)
    }
    return []
}
