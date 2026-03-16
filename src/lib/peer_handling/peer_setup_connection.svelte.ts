import type { DataConnection, Peer } from "peerjs"
import toast from "svelte-5-french-toast"
import { APP_CONFIG } from "$lib/config"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { Message, type TMessage, type TSetupOptions } from "$lib/types/peer_to_peer"
import { emote_state } from "$lib/utils/emotes.svelte"
import { get_speedup_factor, should_start_catching_up, should_stop_catching_up } from "./peer_catchup.svelte"
import { connection_send_validated } from "./peer_send.svelte"

let last_seek_toast_time = 0
export function setup_connection(peer: Peer, conn: DataConnection, options: TSetupOptions) {
    conn.on("open", () => {
        if (options.send_init) {
            connection_send_validated(conn, {
                type: "init_connect",
                peer_ids: temp_state.peer_connections.map((c) => c.peer),
                playlist: temp_state.playlist,
                playlist_index: temp_state.playlist_index,
                video_target_playback_speed: temp_state.video_target_playback_speed,
                video_current_time: temp_state.video_current_time,
                video_state_paused: temp_state.video_state_paused,
            })
        }
    })

    // biome-ignore lint/suspicious/noExplicitAny: data may be anything
    conn.on("data", (data: any) => {
        const data_validated: TMessage = Message.parse(data)
        switch (data_validated.type) {
            case "init_connect": {
                const peers_connected = temp_state.peer_connections.map((c) => c.peer)
                data_validated.peer_ids.forEach((peer_id) => {
                    // Connect to missing peers
                    if (!peers_connected.includes(peer_id) && peer_id !== perma_state.global_settings.peer_id) {
                        peer.connect(peer_id)
                        setup_connection(peer, conn, { send_init: false })
                    }
                })

                // Sync local data
                temp_state.playlist = data_validated.playlist
                temp_state.playlist_index = data_validated.playlist_index
                temp_state.video_target_playback_speed = data_validated.video_target_playback_speed
                temp_state.video_current_time = data_validated.video_current_time
                temp_state.video_state_paused = data_validated.video_state_paused
                break
            }
            case "playlist_set":
                temp_state.playlist = data_validated.playlist
                if (temp_state.playlist_index !== data_validated.playlist_index) {
                    // Reset catch-up on new video
                    temp_state.video_p2p_max_time = 0
                }
                temp_state.playlist_index = data_validated.playlist_index
                console.log("Receiving playlist set")
                break
            case "video_play":
                console.log("Receiving play")
                if (temp_state.is_sleeping) {
                    console.log("Sleeping - don't play")
                    toast(`No playing while sleeping`, { position: APP_CONFIG.toast_location })
                } else {
                    temp_state.video_state_paused = false
                    // Note - video cannot play until user has made some click/interaction on the video. Ready check counts.
                    // temp_state.video_element?.play().catch(() => {
                    //     console.warn("Autoplay blocked by browser")
                    // })
                    toast(`Resumed`, { icon: "⏯️", position: APP_CONFIG.toast_location })
                }
                break
            case "video_pause":
                // TODO: catch up and pause at target time
                console.log("Receiving pause")
                temp_state.video_state_paused = true
                toast(`Paused`, { icon: "⏸️", position: APP_CONFIG.toast_location })
                break
            case "video_seek_to":
                temp_state.video_current_time = data_validated.time
                temp_state.video_p2p_max_time = data_validated.time
                console.log("Receiving seek to")
                if (Date.now() - last_seek_toast_time > 500) {
                    toast(`Seeking`, { icon: "⏩", position: APP_CONFIG.toast_location })
                    last_seek_toast_time = Date.now()
                }
                break
            case "video_set_playback_rate":
                console.log("Receiving playback speed ", data_validated.value)
                temp_state.video_target_playback_speed = data_validated.value
                // If we're not catching up, adjust playback speed immediately (instead of waiting for current_time_interval to do it)
                if (!temp_state.is_catching_up) {
                    temp_state.video_playback_speed = temp_state.video_target_playback_speed
                }
                toast(`Playback rate change to ${data_validated.value}`, {
                    icon: "⏫",
                    duration: 3000,
                    position: APP_CONFIG.toast_location,
                })
                break
            case "video_current_time_interval":
                {
                    const peer_arrive_delay_ms = Date.now() - data_validated.timestamp_now // Package delay
                    const new_max_time = Math.max(temp_state.video_p2p_max_time, data_validated.time) // Peer max time of the video
                    temp_state.video_p2p_max_time = new_max_time + peer_arrive_delay_ms / 1000
                    const time_behind_ms = (temp_state.video_p2p_max_time - temp_state.video_current_time) * 1000

                    temp_state.is_catching_up =
                        temp_state.video_target_playback_speed !== temp_state.video_playback_speed

                    if (temp_state.is_catching_up && should_stop_catching_up(time_behind_ms)) {
                        // Stop catching up
                        temp_state.video_playback_speed = temp_state.video_target_playback_speed
                        temp_state.is_catching_up = false
                        console.log(`Caught up.`)
                    } else if (temp_state.is_catching_up || should_start_catching_up(time_behind_ms)) {
                        // Catch up to the peer that is furthest into the video
                        const speedup_factor = get_speedup_factor(time_behind_ms)
                        temp_state.video_playback_speed = temp_state.video_target_playback_speed * speedup_factor
                        console.log(
                            `Adjusting catch up, behind by ${(temp_state.video_p2p_max_time - temp_state.video_current_time).toFixed(3)} seconds, calculated speedup_factor: ${speedup_factor.toFixed(3)}`,
                        )
                    }
                }
                break
            case "start_ready_check":
                console.log("Receiving start ready check from ", data_validated.peer_id)
                temp_state.ready_peers = new Set(temp_state.ready_peers).add(data_validated.peer_id)
                console.log(temp_state.ready_peers)
                break
            case "send_ready":
                console.log("Received ready from ", data_validated.peer_id)
                temp_state.ready_peers = new Set(temp_state.ready_peers).add(data_validated.peer_id)
                break
            case "send_subtitle_offset":
                console.log("Receiving subtitle_offset", data_validated.subtitle_offset)
                if (temp_state.subtitles.offset !== data_validated.subtitle_offset) {
                    temp_state.subtitles.offset = data_validated.subtitle_offset
                }
                break
            case "send_emote": {
                console.log("Receiving emote", data_validated.emote)
                const incoming_emote = new URL(data_validated.emote)
                if (APP_CONFIG.allowed_emote_origins.includes(incoming_emote.origin)) {
                    emote_state.push({ id: data_validated.id, src: data_validated.emote })
                }
                break
            }
            default:
                break
        }
    })

    conn.on("close", () => {
        // Clean up when peer disconnects
        toast("Peer disconnected", { position: APP_CONFIG.toast_location })
        console.log("Peer disconnected")
        temp_state.peer_connections = temp_state.peer_connections.filter((c) => c !== conn)
        if (
            !temp_state.peer_connections.length &&
            temp_state.video_playback_speed !== temp_state.video_target_playback_speed
        ) {
            console.log("No peers remaining, stopping catch up")
            temp_state.video_playback_speed = Number.isNaN(temp_state.video_target_playback_speed)
                ? 1
                : temp_state.video_target_playback_speed
        }
    })

    conn.on("error", (err) => {
        toast("Peer connection closed/error", { position: APP_CONFIG.toast_location })
        console.error("Connection error, resetting playback_speed:", err)
        if (temp_state.video_playback_speed !== temp_state.video_target_playback_speed) {
            console.log("Peer connection error, stopping catch up")
            temp_state.video_playback_speed = Number.isNaN(temp_state.video_target_playback_speed)
                ? 1
                : temp_state.video_target_playback_speed
        }
    })

    // // Add to our list of active connections
    temp_state.peer_connections = [...temp_state.peer_connections, conn]
}
