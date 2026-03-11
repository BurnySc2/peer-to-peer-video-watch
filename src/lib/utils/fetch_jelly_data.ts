import { type TPlayListItem, temp_state } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"
import { extract_jellyfin_item_id, get_search_params } from "./url_utils"

export function extract_title(data: JellyfinItem | null) {
    if (!data) {
        return null
    }

    // A non-detected jellyfin series
    if (data.SeriesName && !data.ParentIndexNumber && !data.IndexNumber && data.MediaSources?.length === 1) {
        return data.MediaSources[0].Name ?? ""
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
    const [base_url, _params] = get_search_params(url)
    const item_id = extract_jellyfin_item_id(base_url)
    const new_url = `${base_url.origin}/Items/${item_id}/${base_url.search}`

    try {
        const res = await fetch(new_url)
        const data: JellyfinItem = await res.json()
        return data
    } catch (err) {
        console.warn("Metadata fetch failed:", err)
    }
    return null
}

export async function fetch_season_data(url: string, series_id: string, season_id: string | null) {
    const [url_data, params] = get_search_params(url)
    const api_url = `${url_data.origin}/Shows/${series_id}/Episodes?sortBy=IndexNumber&api_key=${params.api_key}`

    try {
        const res = await fetch(api_url)
        // TODO: Add types
        const data = await res.json()
        const data_mapped: TPlayListItem[] = data.Items.filter(
            (item: JellyfinItem) => season_id === null || season_id === item.SeasonId,
        ).map((item: JellyfinItem) => {
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

export async function get_me(video_url: string) {
    // Requests info about the user
    const [base_url, params] = get_search_params(video_url)
    // https://api.jellyfin.org/#tag/User/operation/GetCurrentUser
    const target_url = `${base_url.origin}/Users/Me?api_key=${params.api_key}`
    const response = await fetch(target_url)
    if (response.ok) {
        // TODO Add types
        return await response.json()
    }
    return null
}

export async function update_progress_for_item_id(video_url: string, progress: number) {
    console.assert(0 <= progress && progress <= 1, "Progress needs to be between 0 and 1")

    const [base_url, params] = get_search_params(video_url)
    const item_id = extract_jellyfin_item_id(base_url)
    if (temp_state.jellyfin_my_id === null) {
        const me = await get_me(video_url)
        temp_state.jellyfin_my_id = me.Id
    }

    // https://api.jellyfin.org/#tag/Items/operation/UpdateItemUserData
    const target_url = `${base_url.origin}/UserItems/${item_id}/UserData?userId=${temp_state.jellyfin_my_id}&api_key=${params.api_key}`
    const _response = await fetch(target_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            PlayedPercentage: progress !== 1 ? 100 * progress : null,
            Played: progress === 1 ? true : null,
        }),
    })
}
