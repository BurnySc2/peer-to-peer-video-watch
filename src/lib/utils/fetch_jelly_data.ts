import type { JellyfinItem } from "$lib/types/jellyfin_item"

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
