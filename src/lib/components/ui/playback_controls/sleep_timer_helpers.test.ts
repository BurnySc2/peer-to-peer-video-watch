import { describe, expect, it } from "vitest"
import { next_sleep_remaining, should_trigger_sleep } from "./sleep_timer_helpers"

describe("next_sleep_remaining test", () => {
    it("passes through positive value", () => {
        expect(next_sleep_remaining(5)).toBe(5)
    })

    it("returns zero for zero", () => {
        expect(next_sleep_remaining(0)).toBe(0)
    })

    it("returns zero for negative value", () => {
        expect(next_sleep_remaining(-3)).toBe(0)
    })

    it("passes through fractional value", () => {
        expect(next_sleep_remaining(2.5)).toBe(2.5)
    })
})

describe("should_trigger_sleep test", () => {
    it("returns true at zero", () => {
        expect(should_trigger_sleep(0)).toBe(true)
    })

    it("returns true for negative remaining", () => {
        expect(should_trigger_sleep(-1)).toBe(true)
    })

    it("returns false for positive remaining", () => {
        expect(should_trigger_sleep(5)).toBe(false)
    })
})
