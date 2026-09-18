import { describe, expect, it } from "vitest"
import { peer_age_seconds, peer_status_for } from "./peer_status_helpers"

describe("peer_age_seconds test", () => {
    it("returns one for equal timestamps", () => {
        expect(peer_age_seconds(1000, 1000)).toBe(1)
    })

    it("floors sub second difference", () => {
        expect(peer_age_seconds(1900, 0)).toBe(2)
    })

    it("counts multiple seconds", () => {
        expect(peer_age_seconds(5000, 0)).toBe(6)
    })

    it("returns zero for future timestamp", () => {
        expect(peer_age_seconds(0, 1000)).toBe(0)
    })
})

describe("peer_status_for test", () => {
    it("returns green below six", () => {
        expect(peer_status_for(3)).toBe("green")
    })

    it("returns orange from six to ten", () => {
        expect(peer_status_for(7)).toBe("orange")
    })

    it("returns red from eleven", () => {
        expect(peer_status_for(15)).toBe("red")
    })

    it("matches boundary values five six ten eleven", () => {
        expect(peer_status_for(5)).toBe("green")
        expect(peer_status_for(6)).toBe("orange")
        expect(peer_status_for(10)).toBe("orange")
        expect(peer_status_for(11)).toBe("red")
    })
})
