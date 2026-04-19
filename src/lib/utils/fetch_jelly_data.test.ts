import { beforeEach, describe, expect, it, vi } from "vitest"
import { type TPlayListItem, temp_state } from "$lib/temporary-storage.svelte"
import type { JellyfinItem } from "$lib/types/jellyfin_item"
// import * as api from "./fetch_jelly_data"
import {
    extract_title,
    fetch_file_data,
    fetch_season_data,
    get_me,
    update_progress_for_item_id,
} from "./fetch_jelly_data"

describe("extract_title test", () => {
    it("returns null on null input", () => {
        expect(extract_title(null)).toBeNull()
    })

    it.each([
        // Youtube vid download with little metadata
        [
            {
                Name: "a_youtube_vid",
                SeriesName: "a_youtube_series",
                MediaSources: [{ Id: "an_id" }],
                ProductionYear: 2015,
            } as JellyfinItem,
            "",
        ],
        // Jelly not-series (movie?) with no name
        [
            { Name: "", SeriesName: undefined, MediaSources: [{ Id: "an_id" }], ProductionYear: 2015 } as JellyfinItem,
            "",
        ],
    ])("returns empty string", (input, expected_output) => {
        expect(extract_title(input)).toBe(expected_output)
    })

    it.each([
        // Jelly series episode with all metadata
        [
            {
                Name: "series_ep_name",
                SeriesName: "Series 1",
                ParentIndexNumber: 2,
                IndexNumber: 3,
                ProductionYear: 2015,
            } as JellyfinItem,
            "Series 1 - S2:E3 - series_ep_name (2015)",
        ],
        // Jelly series episode missing year
        [
            {
                Name: "series_ep_name",
                SeriesName: "Series 1",
                ParentIndexNumber: 2,
                IndexNumber: 3,
                ProductionYear: undefined,
            } as JellyfinItem,
            "Series 1 - S2:E3 - series_ep_name",
        ],
        // Jelly series missing episode number
        [
            {
                Name: "series_ep_name",
                SeriesName: "Series 1",
                ParentIndexNumber: 2,
                IndexNumber: undefined,
                ProductionYear: 2015,
            } as JellyfinItem,
            "Series 1 - S2:E? - series_ep_name (2015)",
        ],
        // Jelly series missing season number and episode number
        [
            {
                Name: "series_ep_name",
                SeriesName: "Series 1",
                ParentIndexNumber: undefined,
                IndexNumber: undefined,
                ProductionYear: 2015,
            } as JellyfinItem,
            "Series 1 - S?:E? - series_ep_name (2015)",
        ],
        // Jelly movie (no series name)
        [{ Name: "video_name", SeriesName: undefined, ProductionYear: 2015 } as JellyfinItem, "video_name (2015)"],
    ])("returns formatted title", (input, expected_output) => {
        expect(extract_title(input)).toBe(expected_output)
    })
})

describe("fetch_file_data test", () => {
    it.each([
        ["", null],
        ["bad_url", null],
    ])("%s returns null", async (input, expected_output) => {
        expect(await fetch_file_data(input)).toBe(expected_output)
    })

    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("returns metadata when fetch succeeds", async () => {
        const mock_item = {
            Name: "Some movie",
            ProductionYear: 2015,
        }

        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => mock_item,
        } as Response)

        const url = "https://vodching.example/Items/123456/Download?param=abc&another=def"

        const result = await fetch_file_data(url)
        expect(result).toStrictEqual(mock_item)
        expect(fetch).toHaveBeenCalledWith("https://vodching.example/Items/123456?param=abc&another=def")
    })

    it("returns null when fetch fails", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"))

        const url = "https://vodching.example/Items/123456/Download?param=abc&another=def"

        const result = await fetch_file_data(url)
        expect(result).toBeNull()
    })
})

describe("fetch_season_data test", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    const url = "https://vodching.example/Items/123456/Download?api_key=abc&another=def"
    const mock_item = {
        Items: [
            { Name: "ep_title_one", SeasonId: "a_season_id", Id: "item_id_one" } as JellyfinItem,
            { Name: "ep_title_two", SeasonId: "a_season_id", Id: "item_id_two" } as JellyfinItem,
            { Name: "ep_title_one", SeasonId: "a_different_season_id", Id: "item_id_three" } as JellyfinItem,
        ],
    }

    it("returns only TPlaylistItems in given SeasonId, for a series, when fetch succeeds", async () => {
        const mock_result = [
            {
                url: "https://vodching.example/Items/item_id_one/Download?api_key=abc",
                video_title: "",
                subtitles_original_url: "",
            } as TPlayListItem,
            {
                url: "https://vodching.example/Items/item_id_two/Download?api_key=abc",
                video_title: "",
                subtitles_original_url: "",
            } as TPlayListItem,
        ]
        vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => mock_item } as Response)

        const result = await fetch_season_data(url, "series_id", "a_season_id")
        expect(result).toStrictEqual(mock_result)
        expect(fetch).toHaveBeenCalledWith(
            "https://vodching.example/Shows/series_id/Episodes?sortBy=IndexNumber&api_key=abc",
        )
    })

    it("returns all TPlaylistItems for series, when season_id is null", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => mock_item } as Response)
        const result = await fetch_season_data(url, "series_id", null)
        expect(result.length).toBe(mock_item.Items.length)
        expect(fetch).toHaveBeenCalledWith(
            "https://vodching.example/Shows/series_id/Episodes?sortBy=IndexNumber&api_key=abc",
        )
    })

    it("returns empty array on network failure", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"))
        const result = await fetch_season_data(url, "series_id", "season_id")
        expect(result).toStrictEqual([])
    })
})

describe("get_me test", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    const url = "https://vodching.example/Items/123456/Download?api_key=abc&another=def"

    it("returns json object", async () => {
        const mock_result = {
            Name: "test_name",
            ServerId: "server_id",
            ServerName: "a_server_name",
            Id: "38a5a5bb",
        }
        vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => mock_result } as Response)
        const result = await get_me(url)
        expect(result).toStrictEqual(mock_result)
        expect(fetch).toHaveBeenCalledWith("https://vodching.example/Users/Me?api_key=abc")
    })
    it("returns null on network failure", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network failure"))
        const result = await get_me(url)
        expect(result).toBeNull()
    })
})

describe("update_progress_for_item_id test", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        temp_state.jellyfin_my_id = null
    })

    const input_url = "https://vodching.example/Items/123456/Download?api_key=abc&another=def"

    const expected_post_url = "https://vodching.example/UserItems/123456/UserData?userId=user_123&api_key=abc"

    it("posts progress when id is known", async () => {
        const input_progress = 0.3
        temp_state.jellyfin_my_id = "user_123"

        const fetch_mock = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response)
        const body_mock = JSON.stringify({
            PlaybackPositionTicks: 30 * 10_000_000,
            Played: null,
        })
        await update_progress_for_item_id(input_url, input_progress, 30)

        const [url, options] = fetch_mock.mock.calls[0]

        expect(url).toBe(expected_post_url)
        expect(options?.method).toBe("POST")
        expect(options?.body).toStrictEqual(body_mock)
    })
    it("marks video as played when progress is 1", async () => {
        const input_progress = 1
        temp_state.jellyfin_my_id = "user_123"
        const fetch_mock = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response)

        const body_mock = JSON.stringify({
            PlaybackPositionTicks: 0,
            Played: true,
        })
        await update_progress_for_item_id(input_url, input_progress, 0)

        const [url, options] = fetch_mock.mock.calls[0]

        expect(url).toBe(expected_post_url)
        expect(options?.body).toStrictEqual(body_mock)
    })
    // TODO - how to mock get_me?
    // it("fetches user_id if missing", async () => {
    // })
})
