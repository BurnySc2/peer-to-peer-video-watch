import { describe, expect, it } from "vitest"
import { parse_subtitle_offset } from "./subtitle_helpers"

describe("parse_subtitle_offset test", () => {
    it("parses integer string", () => {
        expect(parse_subtitle_offset("3")).toBe(3)
    })

    it("parses float and negative strings", () => {
        expect(parse_subtitle_offset("1.5")).toBe(1.5)
        expect(parse_subtitle_offset("-2.5")).toBe(-2.5)
    })

    it("parses zero and whitespace strings", () => {
        expect(parse_subtitle_offset("0")).toBe(0)
        expect(parse_subtitle_offset("   ")).toBe(0)
    })

    it("returns null for invalid strings", () => {
        expect(parse_subtitle_offset("abc")).toBeNull()
        expect(parse_subtitle_offset("1.2.3")).toBeNull()
        expect(parse_subtitle_offset("NaN")).toBeNull()
    })

    it("returns zero for empty string", () => {
        expect(parse_subtitle_offset("")).toBe(0)
    })

    it("passes through infinity", () => {
        expect(parse_subtitle_offset("Infinity")).toBe(Infinity)
    })
})
