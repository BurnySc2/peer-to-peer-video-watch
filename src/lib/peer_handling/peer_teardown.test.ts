import type { DataConnection, Peer } from "peerjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { teardown_room } from "./peer_teardown.svelte"

function make_conn() {
    return { close: vi.fn() } as unknown as DataConnection
}

function make_peer() {
    return { destroy: vi.fn(), destroyed: false } as unknown as Peer
}

beforeEach(() => {
    vi.restoreAllMocks()
    temp_state.peer_connections = {}
    temp_state.ready_peers = []
    temp_state.playlist = []
    temp_state.playlist_index = -1
    temp_state.video_current_time = 0
    temp_state.video_p2p_max_time = 0
    temp_state.video_playback_speed = 1
    temp_state.video_target_playback_speed = 1
    temp_state.video_state_paused = true
    temp_state.is_catching_up = false
    temp_state.video_can_play = false
    temp_state.video_duration = 0
    temp_state.video_title = ""
    temp_state.video_element = null
    temp_state.subtitles = { enabled: false, active_url: "", offset: 0 }
    temp_state.emote_state = []
    perma_state.global_settings.peer_id = "my-id"
})

describe("teardown_room", () => {
    it("closes all connections and destroys peer", () => {
        const conn_a = make_conn()
        const conn_b = make_conn()
        temp_state.peer_connections = {
            a: { conn: conn_a, last_seen: Date.now() },
            b: { conn: conn_b, last_seen: Date.now() },
        }
        const peer = make_peer()

        teardown_room(peer)

        expect(conn_a.close).toHaveBeenCalledTimes(1)
        expect(conn_b.close).toHaveBeenCalledTimes(1)
        expect(peer.destroy).toHaveBeenCalledTimes(1)
        expect(temp_state.peer_connections).toEqual({})
    })

    it("clears collections and resets playback state", () => {
        temp_state.ready_peers = ["a"]
        temp_state.playlist = [
            {
                url: "https://example.com/v.mp4",
                video_title: "v",
                subtitles_original_url: "",
                played_progress: 0,
                played_complete: false,
            },
        ]
        temp_state.playlist_index = 2
        temp_state.video_current_time = 42
        temp_state.video_p2p_max_time = 43
        temp_state.video_playback_speed = 2
        temp_state.video_target_playback_speed = 2
        temp_state.video_state_paused = false
        temp_state.is_catching_up = true
        temp_state.video_can_play = true
        temp_state.video_duration = 100
        temp_state.video_title = "title"

        teardown_room(make_peer())

        expect(temp_state.ready_peers).toEqual([])
        expect(temp_state.playlist).toEqual([])
        expect(temp_state.playlist_index).toBe(-1)
        expect(temp_state.video_current_time).toBe(0)
        expect(temp_state.video_playback_speed).toBe(1)
        expect(temp_state.video_state_paused).toBe(true)
        expect(temp_state.is_catching_up).toBe(false)
    })

    it("unloads peer id by default", () => {
        perma_state.global_settings.peer_id = "abc"

        teardown_room(make_peer())

        expect(perma_state.global_settings.peer_id).toBe("")
    })

    it("preserves peer id when flag set", () => {
        perma_state.global_settings.peer_id = "abc"

        teardown_room(make_peer(), { preserve_peer_id: true })

        expect(perma_state.global_settings.peer_id).toBe("abc")
    })

    it("tolerates missing peer", () => {
        temp_state.peer_connections = { a: { conn: make_conn(), last_seen: Date.now() } }

        expect(() => teardown_room(null)).not.toThrow()
        expect(temp_state.peer_connections).toEqual({})
    })

    it("stays idempotent on second run", () => {
        const peer = make_peer()
        temp_state.peer_connections = { a: { conn: make_conn(), last_seen: Date.now() } }

        teardown_room(peer)
        expect(() => teardown_room(peer)).not.toThrow()
        expect(temp_state.peer_connections).toEqual({})
        expect(temp_state.ready_peers).toEqual([])
    })
})
