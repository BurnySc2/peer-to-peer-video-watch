import { describe, expect, it } from "vitest"
import { build_auth_headers, extract_jellyfin_item_id, get_search_params, is_valid_url } from "./url_utils"

describe("is_valid_url", () => {
    it.each([
        ["sometext", false],
        ["httpsometext.com", false],
        ["https://example.com", true],
        ["http://localhost:8000/video.mp4", true],
    ])("returns %s -> %s", (input, expected) => {
        expect(is_valid_url(input)).toBe(expected)
    })
})

describe("get_search_params", () => {
    it.each([
        ["https://example.com", "https://example.com", "/", {}],
        [
            "http://localhost:8000/room?room_id=78371f61-e8de-4fb4-b3ad",
            "http://localhost:8000",
            "/room",
            { room_id: "78371f61-e8de-4fb4-b3ad" },
        ],
        [
            "https://examplesite.com/room?room_id=78371f61-e8de-4fb4-b3ad&peer_id=2938659-b324-6354-l2",
            "https://examplesite.com",
            "/room",
            {
                room_id: "78371f61-e8de-4fb4-b3ad",
                peer_id: "2938659-b324-6354-l2",
            },
        ],
    ])("parses %s", (input, expected_origin, expected_path, expected_params) => {
        const [url, params] = get_search_params(input)

        expect(url.origin).toBe(expected_origin)
        expect(url.pathname).toBe(expected_path)
        expect(params).toStrictEqual(expected_params)
    })
})

describe("extract_jellyfin_item_id", () => {
    it.each([
        [new URL("https://sub.example.org/category/some_id/more_path"), "some_id"],
        [new URL("https://sub.example.org/other"), undefined],
    ])("parses %s", (input, expected_output) => {
        expect(extract_jellyfin_item_id(input)).toStrictEqual(expected_output)
    })
})

describe("build_auth_headers", () => {
    it("returns canonical scheme for key", () => {
        expect(build_auth_headers("abc")).toStrictEqual({ Authorization: 'MediaBrowser Token="abc"' })
    })
    it.each([[undefined], [""]])("returns empty object for %s", (input) => {
        expect(build_auth_headers(input)).toStrictEqual({})
    })
})
