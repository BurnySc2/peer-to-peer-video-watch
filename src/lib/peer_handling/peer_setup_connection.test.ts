import type { DataConnection, Peer } from "peerjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { perma_state } from "$lib/persistent-storage.svelte"
import { peer_count, temp_state } from "$lib/temporary-storage.svelte"
import {
    PEER_TIMEOUT_MS,
    setup_connection,
    stop_reconnect_loop,
    sweep_stale_peers,
} from "./peer_setup_connection.svelte"

vi.mock("svelte-5-french-toast", () => ({ default: vi.fn() }))

function make_conn(peer_id: string, open = false) {
    const handlers: Record<string, (...args: never[]) => void> = {}
    const conn = {
        peer: peer_id,
        open,
        close: vi.fn(),
        send: vi.fn(),
        on: vi.fn((event: string, cb: (...args: never[]) => void) => {
            handlers[event] = cb
        }),
    } as unknown as DataConnection
    return { conn, handlers }
}

function make_peer(destroyed = false) {
    return {
        destroyed,
        connect: vi.fn(),
        destroy: vi.fn(),
    } as unknown as Peer
}

beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    stop_reconnect_loop()
    temp_state.peer_connections = {}
    temp_state.ready_peers = []
    temp_state.video_playback_speed = 1
    temp_state.video_target_playback_speed = 1
    perma_state.global_settings.peer_id = "member-1"
})

describe("setup_connection open gate", () => {
    it("does not insert before open", () => {
        const peer = make_peer()
        const { conn } = make_conn("remote-1", false)

        setup_connection(peer, conn, { send_init: false })

        expect(peer_count()).toBe(0)
        expect(temp_state.peer_connections["remote-1"]).toBeUndefined()
    })

    it("inserts on open", () => {
        const peer = make_peer()
        const { conn, handlers } = make_conn("remote-1", false)

        setup_connection(peer, conn, { send_init: false })
        handlers.open()

        expect(peer_count()).toBe(1)
        expect(temp_state.peer_connections["remote-1"].conn).toBe(conn)
    })

    it("closes old conn on duplicate open", () => {
        const peer = make_peer()
        const old = make_conn("dup", true)
        temp_state.peer_connections = { dup: { conn: old.conn, last_seen: Date.now() } }
        const fresh = make_conn("dup", false)

        setup_connection(peer, fresh.conn, { send_init: false })
        fresh.handlers.open()

        expect(old.conn.close).toHaveBeenCalledTimes(1)
        expect(temp_state.peer_connections.dup.conn).toBe(fresh.conn)
    })
})

describe("sweep stale peers", () => {
    it("evicts only stale peers and cleans ready peers", () => {
        const stale = make_conn("stale", true)
        const fresh = make_conn("fresh", true)
        temp_state.peer_connections = {
            stale: { conn: stale.conn, last_seen: Date.now() - (PEER_TIMEOUT_MS + 1000) },
            fresh: { conn: fresh.conn, last_seen: Date.now() },
        }
        temp_state.ready_peers = ["stale", "fresh"]

        const evicted = sweep_stale_peers(PEER_TIMEOUT_MS)

        expect(evicted).toEqual(["stale"])
        expect(Object.keys(temp_state.peer_connections)).toEqual(["fresh"])
        expect(temp_state.ready_peers).toEqual(["fresh"])
        expect(stale.conn.close).toHaveBeenCalledTimes(1)
        expect(fresh.conn.close).not.toHaveBeenCalled()
    })
})

describe("close destroyed guard", () => {
    it("does not reconnect when peer destroyed", () => {
        vi.stubGlobal("window", { location: { search: "?room_id=host-1" } })
        const peer = make_peer(true)
        const { conn, handlers } = make_conn("host-1", true)

        setup_connection(peer, conn, { send_init: false })
        handlers.close()

        expect(peer.connect).not.toHaveBeenCalled()
        expect(temp_state.peer_connections["host-1"]).toBeUndefined()
        stop_reconnect_loop()
    })
})
