import { describe, expect, it } from "vitest"
import { dedupe_emote_urls, normalize_emote_url, split_emote_input } from "./emote_helpers"

describe("split_emote_input test", () => {
    it("returns single entry when no separator present", () => {
        const raw_input = "https://cdn.7tv.app/emote/abc123/4x.avif"
        expect(split_emote_input(raw_input)).toStrictEqual([raw_input])
    })

    it("splits on comma", () => {
        const raw_input = "https://a.example/one.avif,https://b.example/two.avif"
        expect(split_emote_input(raw_input)).toStrictEqual(["https://a.example/one.avif", "https://b.example/two.avif"])
    })

    it("splits on space", () => {
        const raw_input = "https://a.example/one.avif https://b.example/two.avif"
        expect(split_emote_input(raw_input)).toStrictEqual(["https://a.example/one.avif", "https://b.example/two.avif"])
    })

    it("prefers comma when both separators present", () => {
        const raw_input = "https://a.example/one.avif,https://b.example/two.avif https://c.example/three.avif"
        expect(split_emote_input(raw_input)).toStrictEqual([
            "https://a.example/one.avif",
            "https://b.example/two.avif https://c.example/three.avif",
        ])
    })

    it("returns array with empty string for empty input", () => {
        expect(split_emote_input("")).toStrictEqual([""])
    })
})

describe("normalize_emote_url test", () => {
    it("rewrites seven tv page url to cdn url", () => {
        const allowed_list = ["https://7tv.app"]
        expect(normalize_emote_url("https://7tv.app/emotes/abc123", allowed_list)).toBe(
            "https://cdn.7tv.app/emote/abc123/4x.avif",
        )
    })

    it("returns href for allowed origin", () => {
        const allowed_list = ["https://cdn.7tv.app"]
        expect(normalize_emote_url("https://cdn.7tv.app/emote/abc123/4x.avif", allowed_list)).toBe(
            "https://cdn.7tv.app/emote/abc123/4x.avif",
        )
    })

    it("trims surrounding whitespace", () => {
        const allowed_list = ["https://cdn.7tv.app"]
        expect(normalize_emote_url("  https://cdn.7tv.app/emote/abc123/4x.avif  ", allowed_list)).toBe(
            "https://cdn.7tv.app/emote/abc123/4x.avif",
        )
    })

    it("returns null for disallowed origin", () => {
        const allowed_list = ["https://cdn.7tv.app"]
        expect(normalize_emote_url("https://evil.example/bad.avif", allowed_list)).toBeNull()
    })

    it("returns null for invalid url", () => {
        const allowed_list = ["https://cdn.7tv.app"]
        expect(normalize_emote_url("not_a_url", allowed_list)).toBeNull()
    })
})

describe("dedupe_emote_urls test", () => {
    it("drops candidates already stored", () => {
        const existing_list = ["https://a.example/one.avif"]
        const candidate_list = ["https://a.example/one.avif", "https://b.example/two.avif"]
        expect(dedupe_emote_urls(existing_list, candidate_list)).toStrictEqual(["https://b.example/two.avif"])
    })

    it("drops repeats within candidates preserving order", () => {
        const existing_list: string[] = []
        const candidate_list = [
            "https://b.example/two.avif",
            "https://a.example/one.avif",
            "https://b.example/two.avif",
            "https://c.example/three.avif",
        ]
        expect(dedupe_emote_urls(existing_list, candidate_list)).toStrictEqual([
            "https://b.example/two.avif",
            "https://a.example/one.avif",
            "https://c.example/three.avif",
        ])
    })

    it("returns empty array when all dupes or no candidates", () => {
        const existing_list = ["https://a.example/one.avif"]
        expect(dedupe_emote_urls(existing_list, ["https://a.example/one.avif"])).toStrictEqual([])
        expect(dedupe_emote_urls(existing_list, [])).toStrictEqual([])
    })
})
