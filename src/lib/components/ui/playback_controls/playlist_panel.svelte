<script lang="ts">
import PlayIcon from "$lib/icons/PlayIcon.svelte"
import TrashIcon from "$lib/icons/TrashIcon.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { type TPlayListItem, temp_state } from "$lib/temporary-storage.svelte"
import { solo_watch_set_player_progress } from "$lib/types/video_player"
import { extract_title, fetch_file_data, fetch_season_data } from "$lib/utils/fetch_jelly_data"
import { add_recent_playlist_item, update_title_playlist_items } from "$lib/utils/playlist"
import { get_subs_url } from "$lib/utils/subtitles_fetching"
import { is_valid_url } from "$lib/utils/url_utils"
import { select_items_needing_metadata } from "./jellyfin_batch_helpers"
import {
    build_new_playlist_item,
    chunk_into_batches,
    count_deletions_before_index,
    filter_playlist_deleting_selected,
    index_for_selected_url,
    playlists_have_same_order,
    reject_duplicate_url,
} from "./playlist_helpers"

interface MyProps {
    send_playlist_set?: (message: { playlist: TPlayListItem[]; playlist_index: number }) => void
}
let {
    send_playlist_set = (message: { playlist: TPlayListItem[]; playlist_index: number }) => {
        console.log("Sending playlist_set", message)
    },
}: MyProps = $props()

let input_new_playlist_url = $state("")
let select_playlist_items = $state<string[]>([])
let show_dropdown = $state(false)

async function fetch_metadata(
    jellyfin_item_url: string,
    fetch_file = fetch_file_data,
): Promise<{
    video_title: string | null
    subtitles_original_url: string | null
    played_progress: number
    played_complete: boolean
}> {
    // Fetches title and subtitles as well as metadata, fetch injected for testability
    const metadata = await fetch_file(jellyfin_item_url)
    const video_title = extract_title(metadata)
    const subtitles_original_url = get_subs_url(jellyfin_item_url, metadata)

    // For dropdown of recent playlist items
    if (video_title) {
        update_title_playlist_items(jellyfin_item_url, video_title)
    }
    return {
        video_title,
        subtitles_original_url,
        played_progress: (metadata?.UserData.PlaybackPositionTicks ?? 0) / 10_000_000,
        played_complete: metadata?.UserData.Played ?? false,
    }
}

async function fetch_metadata_for_playlist() {
    // Fetches titles and subtitles for all playlist items, then syncs them with peers
    const playlist = $state.snapshot(temp_state.playlist)

    const BATCH_SIZE = 50

    const items_needing_metadata = select_items_needing_metadata(
        playlist,
        (item) => item.video_title === "" || item.subtitles_original_url === "",
    )
    const batches = chunk_into_batches(items_needing_metadata, BATCH_SIZE)

    for (const batch of batches) {
        await Promise.all(
            batch.map(async (item) => {
                const data = await fetch_metadata(item.url)
                if (data.video_title !== null) {
                    item.video_title = data.video_title
                }
                if (data.subtitles_original_url !== null) {
                    item.subtitles_original_url = data.subtitles_original_url
                }
                item.played_progress = data.played_progress
                item.played_complete = data.played_complete
            }),
        )
    }

    // Verify active playlist has same urls and order after fetch operation
    const current_snapshot = $state.snapshot(temp_state.playlist)
    if (!playlists_have_same_order(current_snapshot, playlist)) {
        return
    }

    // Update title and subtitle url locally
    temp_state.playlist = playlist

    // Solo watch: Restore playback progress
    solo_watch_set_player_progress()

    // Sync with peers
    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: temp_state.playlist_index,
    })
}

async function add_playlist_item(_event: Event) {
    if (!input_new_playlist_url) {
        return
    }

    if (!is_valid_url(input_new_playlist_url)) {
        return
    }

    // Reset input value
    const new_playlist_url = input_new_playlist_url
    input_new_playlist_url = ""
    // Prevent adding duplicates
    if (reject_duplicate_url(temp_state.playlist, new_playlist_url)) {
        return
    }

    temp_state.playlist.push(build_new_playlist_item(new_playlist_url) as TPlayListItem)
    // If video player is inactive, activate it with first video
    if (temp_state.playlist_index === -1) {
        temp_state.playlist_index = 0
    }

    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: temp_state.playlist_index,
    })

    add_recent_playlist_item(new_playlist_url)

    // Fetch titles and subs, sync after all have been fetched
    fetch_metadata_for_playlist()
}

async function add_jellyfin_season(_event: Event, fetch_file = fetch_file_data, fetch_season = fetch_season_data) {
    if (!input_new_playlist_url) {
        return
    }
    if (!is_valid_url(input_new_playlist_url)) {
        return
    }
    // Reset input value
    const new_playlist_url = input_new_playlist_url
    input_new_playlist_url = ""

    const metadata = await fetch_file(new_playlist_url)
    if (!metadata) {
        return
    }
    const series_id = metadata.SeriesId
    const season_id = metadata.SeasonId ?? null
    if (!series_id) {
        // No data available, invalid url or is movie
        return
    }
    const episodes = await fetch_season(new_playlist_url, series_id, season_id)

    // Update playlist and index locally
    const urls_in_playlist = new Set(temp_state.playlist.map((i) => i.url))
    temp_state.playlist = [...temp_state.playlist, ...episodes.filter((i) => !urls_in_playlist.has(i.url))]
    // If video player is inactive, activate it with first video
    if (temp_state.playlist_index === -1) {
        temp_state.playlist_index = 0
    }

    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: temp_state.playlist_index,
    })

    add_recent_playlist_item(new_playlist_url)

    // Fetch titles and subs, sync after all have been fetched
    fetch_metadata_for_playlist()
}

function remove_watched_items(_event: Event) {
    // Removes all playlist items that have been marked as complete in jellyfin
    const deleted_items_before_index = count_deletions_before_index(
        temp_state.playlist,
        temp_state.playlist_index,
        (playlist_item) => playlist_item.played_complete,
    )
    const new_playlist = temp_state.playlist.filter((playlist_item) => !playlist_item.played_complete)

    temp_state.playlist = new_playlist
    temp_state.playlist_index = temp_state.playlist_index - deleted_items_before_index

    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: temp_state.playlist_index,
    })
}

function delete_playlist_item(_event: Event) {
    // Delete items, set new index
    const current_playing = temp_state.playlist[temp_state.playlist_index]
    const { next, next_index } = filter_playlist_deleting_selected(
        temp_state.playlist,
        select_playlist_items,
        current_playing.url,
    )
    temp_state.playlist = next
    temp_state.playlist_index = next_index
    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: next_index,
    })
}

function set_playlist_index() {
    const selected_url = select_playlist_items[0]
    const target_index = index_for_selected_url(temp_state.playlist, selected_url)
    if (target_index === temp_state.playlist_index) {
        return
    }
    temp_state.playlist_index = target_index
    temp_state.video_current_time = 0
    temp_state.video_p2p_max_time = 0
    temp_state.video_state_paused = true
    temp_state.video_can_play = false
    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: target_index,
    })
}

function handle_clear_recent_items() {
    perma_state.global_settings.recent_playlist_items = []
}
</script>

<div class="relative col-start-1 flex flex-col">
    <input
        class="border border-gray-600 rounded p-2 text-center"
        type="url"
        placeholder="New playlist item"
        onfocus={() => show_dropdown = true}
        onblur={() => {setTimeout(() => {
            show_dropdown = false
        }, 200);}}
        oninput={() => show_dropdown = false}
        bind:value={input_new_playlist_url}
    >
    {#if show_dropdown && perma_state.global_settings.recent_playlist_items.length}
        <div class="absolute left-0 right-0 mt-12 bg-white border text-black rounded">
            {#each perma_state.global_settings.recent_playlist_items as item}
                <button
                    type="button"
                    class="block w-full p-2 hover:bg-gray-100 cursor-pointer truncate text-left"
                    onclick={() => {input_new_playlist_url = item.url}}
                    title={item.title || item.url}
                >
                    {item.title || item.url}
                </button>
            {/each}
            <button
                type="button"
                class="block w-full p-2 hover:bg-red-100 cursor-pointer truncate text-center"
                onclick={handle_clear_recent_items}
                aria-label="Clear recent items"
            >
                Clear recent items
            </button>
        </div>
    {/if}
</div>
<div class="col-start-2 col-span-3 row-span-3 items-center border border-gray-600 rounded text-center">
    {#if temp_state.playlist.length}
        <div class="flex flex-col h-full">
            <label
                class="select-none p-2"
                for="select-playlist"
                >Current playlist
                {temp_state.playlist.length > 0? `(${temp_state.playlist.length} item${temp_state.playlist.length > 1 ? "s" : ""})` : ""}</label
            >
            <select
                class="border-t border-gray-600 p-1 flex-1"
                id="select-playlist"
                multiple
                bind:value={select_playlist_items}
            >
                {#each temp_state.playlist as item}
                    <option value={item.url}>{item.video_title || item.url}</option>
                {/each}
            </select>
        </div>
    {:else}
        <span>Current playlist empty</span>
    {/if}
</div>
<div class="flex h-full items-center gap-x-2">
    <button
        class="p-2 border border-gray-600 rounded hover:bg-blue-400"
        class:opacity-0={select_playlist_items.length !== 1}
        disabled={select_playlist_items.length < 1}
        title="Play selected item"
        onclick={set_playlist_index}
    >
        <PlayIcon />
    </button>
    <button
        class="p-2 border border-gray-600 rounded hover:bg-blue-400"
        class:opacity-0={select_playlist_items.length < 1}
        disabled={select_playlist_items.length < 1}
        title="Delete selected item"
        onclick={delete_playlist_item}
    >
        <TrashIcon />
    </button>
</div>
<div class="col-start-1 flex flex-col">
    <button
        class="border border-gray-600 rounded hover:bg-blue-400 p-2 select-none"
        onclick={add_playlist_item}
    >
        Add to playlist
    </button>
</div>
<div class="col-start-1 flex flex-col">
    <button
        class="border border-gray-600 rounded hover:bg-blue-400 p-2 select-none"
        onclick={add_jellyfin_season}
    >
        Add jellyfin season
    </button>
</div>
<div class="col-start-1 flex flex-col">
    <button
        title="Removes items from playlist that have been fully played or have progress marked as completed"
        class="border border-gray-600 rounded hover:bg-red-400 p-2 select-none"
        class:hidden={!temp_state.playlist.some(item => item.played_complete)}
        onclick={remove_watched_items}
    >
        Remove watched items
    </button>
</div>
