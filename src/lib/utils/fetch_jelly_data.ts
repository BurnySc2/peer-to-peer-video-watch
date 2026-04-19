import { type TPlayListItem, temp_state } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"
import type { JellyfinUser } from "$lib/types/jellyfin_user"
import { extract_jellyfin_item_id, get_search_params, is_valid_url } from "./url_utils"

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
    if (!url.includes("vodching") || !is_valid_url(url)) {
        return null
    }
    const [base_url, _params] = get_search_params(url)
    const item_id = extract_jellyfin_item_id(base_url)
    const new_url = `${base_url.origin}/Items/${item_id}${base_url.search}`

    try {
        const res = await fetch(new_url)
        const data: JellyfinItem = await res.json()
        return data
    } catch (err) {
        console.warn("Metadata fetch failed:", err)
    }
    return null
}

export async function fetch_season_data(
    url: string,
    series_id: string,
    season_id: string | null,
): Promise<TPlayListItem[]> {
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

export async function get_me(video_url: string): Promise<JellyfinUser | null> {
    // Requests info about the user
    const [base_url, params] = get_search_params(video_url)
    if (params.api_key === undefined) {
        return null
    }
    // https://api.jellyfin.org/#tag/User/operation/GetCurrentUser
    const target_url = `${base_url.origin}/Users/Me?api_key=${params.api_key}`
    try {
        const response = await fetch(target_url)
        if (response.ok) {
            const data = (await response.json()) as JellyfinUser
            return data
        }
    } catch (err) {
        console.warn("get_me fetch failed:", err)
    }
    return null
}

async function get_user_item_url(video_url: string): Promise<string | null> {
    // Both update_progress_for_item_id and get_progress_for_item_id need the same URL and userId.
    // This helper avoids duplicating the item_id extraction and jellyfin_my_id resolution logic.
    // Returns null if the userId cannot be resolved (e.g., non-jellyfin URL or API error).
    const [base_url, params] = get_search_params(video_url)
    const item_id = extract_jellyfin_item_id(base_url)

    if (temp_state.jellyfin_my_id === null) {
        const me = await get_me(video_url)
        if (!me) {
            return null
        }
        temp_state.jellyfin_my_id = me.Id
    }

    return `${base_url.origin}/UserItems/${item_id}/UserData?userId=${temp_state.jellyfin_my_id}&api_key=${params.api_key}`
}

export async function update_progress_for_item_id(
    video_url: string,
    progress: number,
    video_current_time_seconds: number,
) {
    console.assert(0 <= progress && progress <= 1, "Progress needs to be between 0 and 1")

    const target_url = await get_user_item_url(video_url)
    if (!target_url) {
        return
    }

    // https://api.jellyfin.org/#tag/Items/operation/UpdateItemUserData
    const _response = await fetch(target_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            PlaybackPositionTicks: video_current_time_seconds * 10_000_000,
            Played: progress === 1 ? true : null,
        }),
    })
}

export async function get_progress_for_item_id(video_url: string): Promise<number | null> {
    const target_url = await get_user_item_url(video_url)
    if (!target_url) {
        return null
    }

    // https://api.jellyfin.org/#tag/Items/operation/GetItemUserData
    try {
        const response = await fetch(target_url)
        if (response.ok) {
            const data = await response.json()
            return data.PlayedPercentage !== null ? data.PlayedPercentage / 100 : null
        }
    } catch (err) {
        console.warn("get_progress_for_item_id fetch failed:", err)
    }
    return null
}
