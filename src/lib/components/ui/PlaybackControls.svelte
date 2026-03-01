<script lang="ts">
import { untrack } from "svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { TPlayListItem } from "$lib/types/peer_to_peer"
import { PLAYBACK_SPEED_VALUES } from "$lib/types/video_player"
import { get_subs_url } from "$lib/utils/build_subtitles"
import { extract_title, fetch_file_data } from "$lib/utils/fetch_jelly_data"

interface MyProps {
    send_playlist_set?: (message: { playlist: TPlayListItem[]; playlist_index: number }) => void
    send_video_set_playback_rate?: (message: { time: number; value: number }) => void
}
let {
    send_playlist_set = (message: { playlist: TPlayListItem[]; playlist_index: number }) => {
        console.log("Sending playlist_set", message)
    },
    send_video_set_playback_rate = (message: { time: number; value: number }) => {
        console.log("Sending video_set_playback_rate", message.value)
    },
}: MyProps = $props()

// Input items
let input_new_playlist_url = $state("")
let select_playlist_items = $state<string[]>([])

async function add_playlist_item(_event: Event) {
    if (!input_new_playlist_url) {
        return
    }

    const exists = temp_state.playlist.some((item) => item.url === input_new_playlist_url)
    if (!exists) {
        const index =
            temp_state.playlist.push({
                url: input_new_playlist_url,
                video_title: input_new_playlist_url,
                subtitles_original_url: "",
            }) - 1

        const metadata = await fetch_file_data(input_new_playlist_url)
        const video_title = extract_title(metadata)
        const subs_original_url = get_subs_url(metadata)

        temp_state.playlist[index] = {
            ...temp_state.playlist[index],
            video_title: video_title || "",
            subtitles_original_url: subs_original_url || "",
        }
        console.log("Added to playlist ", temp_state.playlist)
    }

    input_new_playlist_url = ""
    send_playlist_set({
        playlist: temp_state.playlist,
        playlist_index: temp_state.playlist_index,
    })
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

$effect(() => {
    send_video_set_playback_rate({
        value: temp_state.video_playback_speed,
        time: untrack(() => temp_state.video_current_time),
    })
})
</script>

<div class="flex items-center space-x-2">
    <label for="playback_speed">Playback rate</label>
    <select
        class="border m-2"
        id="playback_speed"
        bind:value={temp_state.video_playback_speed}
    >
        {#each PLAYBACK_SPEED_VALUES as ps}
            <option value={ps}>{ps}</option>
        {/each}
    </select>
    <div class="mx-2">|</div>
    <label
        class="mx-2"
        for="volume_control"
        >Volume</label
    >
    <div
        class="relative w-full mx-2"
        role="presentation"
        onpointermove={handle_volume_hover}
        onpointerleave={() => (volume_hover_value = null)}
    >
        <input
            type="range"
            class="w-full"
            min="0"
            max="1"
            step="0.01"
            value={temp_state.video_element?.volume || 0}
            oninput={(e) => {
                temp_state.video_element!.volume = (
                    e.target as HTMLInputElement
                ).valueAsNumber;
            }}
        >

        {#if volume_hover_value !== null}
            <div
                class="absolute -top-6 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none"
                style="left: {volume_hover_percent}%"
            >
                {Math.round(volume_hover_value * 100)}%
            </div>
        {/if}
    </div>
</div>
<div class="flex items-center space-x-2">
    <label for="autoplay">Autoplay</label>
    <input
        type="checkbox"
        id="autoplay"
    >
</div>
<div class="flex items-center space-x-2">
    <input
        type="url"
        placeholder="New playlist item"
        bind:value={input_new_playlist_url}
    >
    <button
        class="p-2 border hover:bg-blue-400"
        onclick={add_playlist_item}
    >
        Add to playlist
    </button>
</div>
<div class="flex items-center space-x-2">
    <label for="select-playlist">Current playlist</label>
    <select
        id="select-playlist"
        multiple
        bind:value={select_playlist_items}
    >
        {#each temp_state.playlist as item}
            <option value={item.url}>{item.video_title || item.url}</option>
        {/each}
    </select>
    <button
        class="p-2 border hover:bg-blue-400"
        class:opacity-0={select_playlist_items.length !== 1}
        disabled={select_playlist_items.length < 1}
        onclick={set_playlist_index}
    >
        Play
    </button>
    <button
        class="p-2 border hover:bg-blue-400"
        class:opacity-0={select_playlist_items.length < 1}
        disabled={select_playlist_items.length < 1}
        onclick={delete_playlist_item}
    >
        Delete
    </button>
</div>
