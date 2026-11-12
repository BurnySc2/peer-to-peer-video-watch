import { describe, expect, it } from "vitest"
import type { TPlayListItem } from "$lib/temporary-storage.svelte"
import { remove_watched_playlist_items } from "./playlist_remove"

function mk(url: string, complete: boolean): TPlayListItem {
    return {
        url,
        video_title: "",
        subtitles_original_url: "",
        played_progress: complete ? 1 : 0,
        played_complete: complete,
        duration_sec: 300,
    }
}

function urls(items: TPlayListItem[]): string[] {
    return items.map((item) => item.url)
}

describe("remove_watched_playlist_items", () => {
    // (a) mixed watched before + after current
    it("removes watched before current and watched after current, shifting index", () => {
        const playlist = [mk("W0", true), mk("U1", false), mk("CUR-U2", false), mk("W3", true), mk("U4", false)]

        const result = remove_watched_playlist_items(playlist, 2)

        expect(urls(result.playlist)).toStrictEqual(["U1", "CUR-U2", "U4"])
        expect(result.playlist_index).toBe(1)
        expect(result.removed_count).toBe(1)
        expect(result.removed_current).toBe(false)
        expect(playlist).toHaveLength(5)
    })

    // (b) unwatched-before-current regression: watched items only after current
    it("keeps index when only watched items are after current", () => {
        const playlist = [mk("U0", false), mk("U1", false), mk("CUR-U2", false), mk("W3", true)]

        const result = remove_watched_playlist_items(playlist, 2)

        expect(urls(result.playlist)).toStrictEqual(["U0", "U1", "CUR-U2"])
        expect(result.playlist_index).toBe(2)
        expect(result.removed_count).toBe(0)
        expect(result.removed_current).toBe(false)
    })

    // (b) zero watched-before with all-unwatched playlist
    it("keeps index when nothing before current was watched", () => {
        const playlist = [mk("U0", false), mk("CUR-U1", false)]

        const result = remove_watched_playlist_items(playlist, 1)

        expect(result.playlist).toBe(playlist)
        expect(result.playlist_index).toBe(1)
        expect(result.removed_count).toBe(0)
        expect(result.removed_current).toBe(false)
    })

    // (c) current item itself was watched: middle of playlist
    it("advances to next item when current watched item in the middle is removed", () => {
        const playlist = [mk("U0", false), mk("CUR-W1", true), mk("U2", false)]

        const result = remove_watched_playlist_items(playlist, 1)

        expect(urls(result.playlist)).toStrictEqual(["U0", "U2"])
        expect(result.playlist_index).toBe(1)
        expect(result.removed_count).toBe(0)
        expect(result.removed_current).toBe(true)
    })

    // (c) current item itself was watched: last in playlist
    it("moves index back when watched current item at the end is removed", () => {
        const playlist = [mk("U0", false), mk("U1", false), mk("CUR-W2", true)]

        const result = remove_watched_playlist_items(playlist, 2)

        expect(urls(result.playlist)).toStrictEqual(["U0", "U1"])
        expect(result.playlist_index).toBe(1)
        expect(result.removed_count).toBe(0)
        expect(result.removed_current).toBe(true)
    })

    // (c) current item itself was watched with watched items before it
    it("advances to next unplayed item when current and items before it are removed", () => {
        const playlist = [mk("W0", true), mk("W1", true), mk("CUR-W2", true), mk("U3", false), mk("U4", false)]

        const result = remove_watched_playlist_items(playlist, 2)

        expect(urls(result.playlist)).toStrictEqual(["U3", "U4"])
        expect(result.playlist_index).toBe(0)
        expect(result.removed_count).toBe(2)
        expect(result.removed_current).toBe(true)
    })

    // (d) every item watched
    it("returns -1 when every item is watched", () => {
        const playlist = [mk("W0", true), mk("CUR-W1", true), mk("W2", true)]

        const result = remove_watched_playlist_items(playlist, 1)

        expect(result.playlist).toStrictEqual([])
        expect(result.playlist_index).toBe(-1)
        expect(result.removed_count).toBe(1)
        expect(result.removed_current).toBe(true)
    })

    // (e) nothing watched: fast path returns the same array
    it("returns the same array when nothing was watched", () => {
        const playlist = [mk("U0", false), mk("CUR-U1", false), mk("U2", false)]

        const result = remove_watched_playlist_items(playlist, 1)

        expect(result.playlist).toBe(playlist)
        expect(result.playlist_index).toBe(1)
        expect(result.removed_count).toBe(0)
        expect(result.removed_current).toBe(false)
    })

    // edge: empty playlist
    it("handles an empty playlist", () => {
        const result = remove_watched_playlist_items([], -1)

        expect(result.playlist).toStrictEqual([])
        expect(result.playlist_index).toBe(-1)
        expect(result.removed_count).toBe(0)
        expect(result.removed_current).toBe(false)
    })
})
