import { describe, expect, it } from "vitest"
import {
    build_new_playlist_item,
    chunk_into_batches,
    count_deletions_before_index,
    filter_playlist_deleting_selected,
    index_for_selected_url,
    playlists_have_same_order,
    reject_duplicate_url,
} from "./playlist_helpers"

describe("build_new_playlist_item test", () => {
    it("builds item with empty metadata", () => {
        const test_url = "https://example.com/video.mp4"
        expect(build_new_playlist_item(test_url)).toStrictEqual({
            url: test_url,
            video_title: "",
            subtitles_original_url: "",
            played_progress: 0,
            played_complete: false,
        })
    })
})

describe("reject_duplicate_url test", () => {
    it("returns true for exact duplicate", () => {
        const input_list = [{ url: "https://example.com/a.mp4" }]
        expect(reject_duplicate_url(input_list, "https://example.com/a.mp4")).toBe(true)
    })

    it("returns false for new url and empty playlist", () => {
        const input_list = [{ url: "https://example.com/a.mp4" }]
        expect(reject_duplicate_url(input_list, "https://example.com/b.mp4")).toBe(false)
        expect(reject_duplicate_url([], "https://example.com/a.mp4")).toBe(false)
    })
})

describe("filter_playlist_deleting_selected test", () => {
    it("keeps playing item even when selected", () => {
        const input_list = [{ url: "a_url" }, { url: "b_url" }, { url: "c_url" }]
        const selected_list = ["a_url", "b_url"]
        const result_data = filter_playlist_deleting_selected(input_list, selected_list, "b_url")
        expect(result_data.next).toStrictEqual([{ url: "b_url" }, { url: "c_url" }])
        expect(result_data.next_index).toBe(0)
    })

    it("deletes only selected non playing items", () => {
        const input_list = [{ url: "a_url" }, { url: "b_url" }, { url: "c_url" }]
        const selected_list = ["c_url"]
        const result_data = filter_playlist_deleting_selected(input_list, selected_list, "a_url")
        expect(result_data.next).toStrictEqual([{ url: "a_url" }, { url: "b_url" }])
        expect(result_data.next_index).toBe(0)
    })

    it("returns minus one and avoids mutation when playing missing", () => {
        const input_list = [{ url: "a_url" }, { url: "b_url" }]
        const input_copy = [{ url: "a_url" }, { url: "b_url" }]
        const result_data = filter_playlist_deleting_selected(input_list, ["a_url"], "missing_url")
        expect(result_data.next).toStrictEqual([{ url: "b_url" }])
        expect(result_data.next_index).toBe(-1)
        expect(input_list).toStrictEqual(input_copy)
    })
})

describe("index_for_selected_url test", () => {
    it("finds first middle last and missing urls", () => {
        const input_list = [{ url: "a_url" }, { url: "b_url" }, { url: "c_url" }]
        expect(index_for_selected_url(input_list, "a_url")).toBe(0)
        expect(index_for_selected_url(input_list, "b_url")).toBe(1)
        expect(index_for_selected_url(input_list, "c_url")).toBe(2)
        expect(index_for_selected_url(input_list, "missing_url")).toBe(-1)
    })
})

describe("count_deletions_before_index test", () => {
    it("counts only deletions strictly before index", () => {
        const input_list = ["a_value", "b_value", "c_value"]
        const deleted_predicate = (item_value: string) => item_value === "a_value" || item_value === "c_value"
        expect(count_deletions_before_index(input_list, 2, deleted_predicate)).toBe(1)
    })

    it("returns zero when nothing deleted before index", () => {
        const input_list = ["a_value", "b_value", "c_value"]
        expect(count_deletions_before_index(input_list, 1, () => false)).toBe(0)
        expect(count_deletions_before_index(input_list, 0, () => true)).toBe(0)
    })
})

describe("chunk_into_batches test", () => {
    it("splits remainder exact empty oversize and size one", () => {
        expect(chunk_into_batches([1, 2, 3, 4, 5], 2)).toStrictEqual([[1, 2], [3, 4], [5]])
        expect(chunk_into_batches([1, 2, 3, 4], 2)).toStrictEqual([
            [1, 2],
            [3, 4],
        ])
        expect(chunk_into_batches([], 2)).toStrictEqual([])
        expect(chunk_into_batches([1, 2], 5)).toStrictEqual([[1, 2]])
        expect(chunk_into_batches([1, 2, 3], 1)).toStrictEqual([[1], [2], [3]])
    })
})

describe("playlists_have_same_order test", () => {
    it("returns true for same order", () => {
        const first_list = [{ url: "a_url" }, { url: "b_url" }]
        const second_list = [{ url: "a_url" }, { url: "b_url" }]
        expect(playlists_have_same_order(first_list, second_list)).toBe(true)
    })

    it("returns true for empty lists", () => {
        expect(playlists_have_same_order([], [])).toBe(true)
    })

    it("returns false for mismatch", () => {
        expect(
            playlists_have_same_order([{ url: "a_url" }, { url: "b_url" }], [{ url: "b_url" }, { url: "a_url" }]),
        ).toBe(false)
        expect(playlists_have_same_order([{ url: "a_url" }], [{ url: "a_url" }, { url: "b_url" }])).toBe(false)
    })
})
