<script lang="ts">
import { untrack } from "svelte"
import { APP_CONFIG } from "$lib/config"
import PlayIcon from "$lib/icons/PlayIcon.svelte"
import TrashIcon from "$lib/icons/TrashIcon.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { peer_count, type TPlayListItem, temp_state } from "$lib/temporary-storage.svelte"
import { PLAYBACK_SPEED_VALUES } from "$lib/types/video_player"
import { extract_title, fetch_file_data, fetch_season_data } from "$lib/utils/fetch_jelly_data"
import { add_recent_playlist_item, update_title_playlist_items } from "$lib/utils/playlist"
import { get_subs_url } from "$lib/utils/subtitles_fetching"
import { is_valid_url } from "$lib/utils/url_utils"
import type { Emote } from "./emotes"

interface MyProps {
    send_playlist_set?: (message: { playlist: TPlayListItem[]; playlist_index: number }) => void
    send_video_set_playback_rate?: (message: { time: number; value: number }) => void
    send_subtitle_offset?: (message: { subtitle_offset: number }) => void
}
let {
    send_playlist_set = (message: { playlist: TPlayListItem[]; playlist_index: number }) => {
        console.log("Sending playlist_set", message)
    },
    send_video_set_playback_rate = (message: { time: number; value: number }) => {
        console.log("Sending video_set_playback_rate", message.value)
    },
    send_subtitle_offset = (message: { subtitle_offset: number }) => {
        console.log("Sending subtitle_offset", message.subtitle_offset)
    },
}: MyProps = $props()

// Input items
let input_new_playlist_url = $state("")
let select_playlist_items = $state<string[]>([])

async function fetch_metadata(jellyfin_item_url: string): Promise<{
    video_title: string | null
    subtitles_original_url: string | null
}> {
    // TODO: Refactor to external file
    // Fetches title and subtitles
    const metadata = await fetch_file_data(jellyfin_item_url)
    const video_title = extract_title(metadata)
    const subtitles_original_url = get_subs_url(jellyfin_item_url, metadata)

    // For dropdown of recent playlist items
    if (video_title) {
        update_title_playlist_items(jellyfin_item_url, video_title)
    }
    return { video_title, subtitles_original_url }
}

async function fetch_metadata_for_playlist() {
    // Fetches titles and subtitles for all playlist items, then syncs them with peers
    const playlist = $state.snapshot(temp_state.playlist) // Deepcopy

    for (const item of playlist) {
        if (item.video_title !== "" && item.subtitles_original_url !== "") {
            // Already have all info, skip
            continue
        }
        const data = await fetch_metadata(item.url)
        if (data.video_title !== null) {
            // Set title
            item.video_title = data.video_title
        }

        if (data.subtitles_original_url !== null) {
            // Set subtitle url
            item.subtitles_original_url = data.subtitles_original_url
        }
    }
    // Verify active playlist has same urls and order
    const current_playlist = $state.snapshot(temp_state.playlist).map((i) => i.url)
    const arrays_equal = (a: string[], b: string[]) =>
        a.length === b.length && a.every((v: string, i: number) => v === b[i])
    if (
        !arrays_equal(
            current_playlist,
            playlist.map((i) => i.url),
        )
    ) {
        return
    }

    // Update title and subtitle url locally
    temp_state.playlist = playlist
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
    const exists = temp_state.playlist.some((item) => item.url === new_playlist_url)
    if (exists) {
        return
    }

    temp_state.playlist.push({
        url: new_playlist_url,
        video_title: "",
        subtitles_original_url: "",
    })
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

async function add_jellyfin_season(_event: Event) {
    if (!input_new_playlist_url) {
        return
    }
    if (!is_valid_url(input_new_playlist_url)) {
        return
    }
    // Reset input value
    const new_playlist_url = input_new_playlist_url
    input_new_playlist_url = ""

    const metadata = await fetch_file_data(new_playlist_url)
    if (!metadata) {
        return
    }
    const series_id = metadata.SeriesId
    const season_id = metadata.SeasonId ?? null
    if (!series_id) {
        // No data available, invalid url or is movie
        return
    }
    const episodes = await fetch_season_data(new_playlist_url, series_id, season_id)

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

function delete_playlist_item(_event: Event) {
    // Delete items, set new index
    const current_playing = temp_state.playlist[temp_state.playlist_index]
    temp_state.playlist = temp_state.playlist.filter(
        (item) => item.url === current_playing.url || !select_playlist_items.includes(item.url),
    )
    const new_index = temp_state.playlist.findIndex((item) => item.url === current_playing.url)
    temp_state.playlist_index = new_index
    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: new_index,
    })
}
function set_playlist_index() {
    // const target_index = temp_state.playlist.indexOf(select_playlist_items[0])
    const selected_url = select_playlist_items[0]
    const target_index = temp_state.playlist.findIndex((item) => item.url === selected_url)
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

let volume_hover_value = $state<number | null>(null)
let volume_hover_percent = $state(0)
function handle_volume_hover(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()

    let percent = (event.clientX - rect.left) / rect.width

    percent = Math.min(1, Math.max(0, percent))

    volume_hover_percent = percent * 100
    volume_hover_value = percent
}

function set_subtitle_offset(value: string) {
    const value_as_number = Number(value)
    if (Number.isNaN(value_as_number)) {
        return
    }
    temp_state.subtitles.offset = value_as_number
    send_subtitle_offset({ subtitle_offset: value_as_number })
}

let flash = $state(false)
let emote_input = $state("")
function handle_emote_submit() {
    flash = true
    setTimeout(() => (flash = false), 300)
    if (perma_state.global_settings.personal_emotes.some((e) => e.url === emote_input)) {
        emote_input = ""
        return
    }

    let split_emotes: string[] = []
    if (emote_input.includes(",")) {
        split_emotes = emote_input.split(",")
    } else if (emote_input.includes(" ")) {
        split_emotes = emote_input.split(" ")
    } else {
        split_emotes = [emote_input]
    }
    emote_input = ""

    split_emotes.forEach((emote) => {
        try {
            const emote_url = new URL(emote.trim())
            if (!APP_CONFIG.allowed_emote_origins.includes(emote_url.origin)) {
                console.log(`Rejecting, invalid origin: ${emote}`)
                return
            }

            let emote_href = emote_url.href

            // Convert 7tv url to cdn.7tv url
            if (emote_url.origin === "https://7tv.app") {
                const emote_id = emote_url.pathname.split("/").at(-1)
                emote_href = `https://cdn.7tv.app/emote/${emote_id}/4x.avif`
            }

            if (perma_state.global_settings.personal_emotes.some((e) => e.url === emote_href)) {
                console.log(`Rejecting, duplicate: ${emote}`)
                return
            }
            const new_emote: Emote = { name: "", url: emote_href }
            perma_state.global_settings.personal_emotes.push(new_emote)
        } catch {
            console.log(`Invalid url ${emote.trim()}`)
            return
        }
    })
}

function handle_clear_recent_items() {
    perma_state.global_settings.recent_playlist_items = []
}

let remaining = $state(0)
let timer: ReturnType<typeof setInterval> | undefined
// Sleep timer - does not broadcast pause
function set_sleep_timer(sleep_time: number) {
    if (timer) {
        clearInterval(timer)
    }
    if (sleep_time <= 0) {
        remaining = 0
        return
    }

    console.log("Starting sleep timer")
    remaining = sleep_time
    timer = setInterval(() => {
        remaining -= 1
        if (remaining <= 0) {
            clearInterval(timer)
            timer = undefined
            temp_state.video_state_paused = true
            temp_state.is_sleeping = true
            console.log("Sleep timer triggered")
            return
        }
    }, 60000)
}
let show_dropdown = $state(false)

$effect(() => {
    send_video_set_playback_rate({
        value: temp_state.video_target_playback_speed,
        time: untrack(() => temp_state.video_current_time),
    })
})
</script>

<div class="grid grid-cols-5 gap-4 max-w-1/2 pb-2">
    {#if temp_state.playlist.length}
        <div class="flex flex-col border border-gray-600 rounded">
            <label
                class="text-center p-1 select-none"
                for="playback_speed"
                >Playback rate</label
            >
            <select
                class="border-t border-gray-600 p-1 text-center"
                id="playback_speed"
                bind:value={// biome-ignore lint/complexity/noCommaOperator: don't fix https://svelte.dev/docs/svelte/bind#Function-bindings
                    () => temp_state.video_target_playback_speed ,
                    (v: number) => {
                        temp_state.video_target_playback_speed = v
                        if (!peer_count()) {
                            temp_state.video_playback_speed = v
                        }
                    }}
            >
                {#each PLAYBACK_SPEED_VALUES as ps}
                    <option
                        class="bg-gray-900"
                        value={ps}
                    >
                        {ps}
                    </option>
                {/each}
            </select>
        </div>
        <div class="flex flex-col col-span-2 border border-gray-600 rounded p-1 w-full">
            <label
                class="text-center select-none"
                for="volume_control"
                >Volume</label
            >
            <div
                class="relative px-2"
                role="presentation"
            >
                <input
                    class="w-full"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    onpointermove={handle_volume_hover}
                    onpointerleave={() => (volume_hover_value = null)}
                    bind:value={perma_state.global_settings.volume}
                    oninput={(e) => {
                        if (volume_hover_value === null) {
                            perma_state.global_settings.volume = (e.currentTarget as HTMLInputElement).valueAsNumber
                            return
                        }
                        perma_state.global_settings.volume = volume_hover_value
                    }}
                >
                {#if volume_hover_value !== null}
                    <div
                        class="absolute -top-6 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded pointer-events-none"
                        style="left: {volume_hover_percent}%"
                    >
                        {Math.round(volume_hover_value * 100)}%
                    </div>
                {/if}
            </div>
        </div>
        <div class="flex flex-col border border-gray-600 rounded">
            <label
                class="text-center select-none"
                for="subtitle_offset"
                >Subs offset</label
            >
            <input
                type="number"
                step="1"
                class="border-t border-gray-600 p-1 text-center"
                id="subtitle_offset"
                value={temp_state.subtitles.offset}
                onfocus={(e) => e.currentTarget.select()}
                oninput={(e) => {
                set_subtitle_offset((e.target as HTMLInputElement).value)
            }}
            >
        </div>
        <div class="flex flex-col border border-gray-600 rounded">
            <label
                class="text-center select-none"
                for="subtitle_font_size"
                >Subs size</label
            >
            <input
                type="number"
                class="border-t border-gray-600 p-1 text-center"
                id="subtitle_font_size"
                step="0.25"
                bind:value={perma_state.global_settings.subtitles_font_size_rem}
            >
        </div>

        <div class="col-start-2 flex flex-col items-center space-y-1 border border-gray-600 rounded p-2">
            <label
                class="select-none"
                for="autoplay"
                >Autoplay</label
            >
            <input
                type="checkbox"
                id="autoplay"
                class=""
                bind:checked={temp_state.autoplay}
            >
        </div>
        <div
            class="flex flex-col items-center border border-gray-600 rounded"
            title="Accepts multiple urls. Middle mouse click emote to delete."
        >
            <label
                class="select-none"
                for="add_emote"
                >Add emote</label
            >
            <input
                type="text"
                id="add_emote"
                data-testid="add-emote"
                placeholder="Paste emote"
                class="border-t border-gray-600 max-w-full transition-colors duration-300 text-center p-1
           {flash ? 'bg-blue-200' : ''}"
                bind:value={emote_input}
                oninput={handle_emote_submit}
            >
        </div>
        <div class="flex flex-col border border-gray-600 rounded">
            <label
                class="text-center"
                for="sleep_timer"
                >{remaining ? `Sleep timer active`: "Sleep timer (mins)"}</label
            >
            <input
                type="number"
                class="border-t border-gray-600 p-1 text-center select-none"
                id="sleep_timer"
                step="5"
                value={remaining}
                oninput={(e) => {
                set_sleep_timer(Number((e.target as HTMLInputElement).value))
            }}
            >
        </div>
    {/if}

    <div class="relative col-start-1 flex flex-col">
        <input
            class="border border-gray-600 rounded p-2 text-center"
            type="url"
            placeholder="New playlist item"
            onfocus={() => show_dropdown = true}
            onblur={() => {setTimeout(() => {
                show_dropdown = false
            }, 100);}}
            oninput={() => show_dropdown = false}
            bind:value={input_new_playlist_url}
        >
        {#if show_dropdown && perma_state.global_settings.recent_playlist_items.length}
            <div class="absolute left-0 right-0 mt-12 bg-white border text-black rounded">
                {#each perma_state.global_settings.recent_playlist_items as item}
                    <div
                        class="p-2 hover:bg-gray-100 cursor-pointer truncate"
                        onmousedown={() => {input_new_playlist_url = item.url}}
                        aria-label="Select URL"
                        role="button"
                        tabindex="0"
                        title={item.title || item.url}
                    >
                        {item.title || item.url}
                    </div>
                {/each}
                <div
                    class="p-2 hover:bg-red-100 cursor-pointer truncate text-center"
                    onmousedown={handle_clear_recent_items}
                    aria-label="Select URL"
                    role="button"
                    tabindex="0"
                >
                    Clear recent items
                </div>
            </div>
        {/if}
    </div>
    <div class="col-start-2 col-span-3 row-span-3 items-center border border-gray-600 rounded p-2 text-center">
        {#if temp_state.playlist.length}
            <div class="flex flex-col h-full">
                <label
                    class="select-none"
                    for="select-playlist"
                    >Current playlist</label
                >
                <select
                    class="border border-gray-600 rounded p-1 flex-1"
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
        <!-- TODO Add entire series? -->
    </div>
</div>
