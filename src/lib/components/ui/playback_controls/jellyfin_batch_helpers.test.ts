import { describe, expect, it } from "vitest"
import { select_items_needing_metadata, urls_have_same_order } from "./jellyfin_batch_helpers"

describe("select_items_needing_metadata test", () => {
    it("filters to needing only", () => {
        const input_list = [1, 2, 3, 4]
        const result_list = select_items_needing_metadata(input_list, (item_value) => item_value % 2 === 0)
        expect(result_list).toStrictEqual([2, 4])
    })

    it("returns all when all need metadata", () => {
        expect(select_items_needing_metadata([1, 2], () => true)).toStrictEqual([1, 2])
    })

    it("returns empty for all false and empty input", () => {
        expect(select_items_needing_metadata([1, 2], () => false)).toStrictEqual([])
        expect(select_items_needing_metadata([], () => true)).toStrictEqual([])
    })

    it("does not mutate input", () => {
        const input_list = [1, 2, 3]
        const input_copy = [1, 2, 3]
        const result_list = select_items_needing_metadata(input_list, (item_value) => item_value > 1)
        expect(result_list).toStrictEqual([2, 3])
        expect(input_list).toStrictEqual(input_copy)
    })
})

describe("urls_have_same_order test", () => {
    it("returns true for identical order", () => {
        expect(urls_have_same_order(["a_url", "b_url"], ["a_url", "b_url"])).toBe(true)
    })

    it("returns false for order mismatch", () => {
        expect(urls_have_same_order(["a_url", "b_url"], ["b_url", "a_url"])).toBe(false)
    })

    it("returns false for length mismatch", () => {
        expect(urls_have_same_order(["a_url"], ["a_url", "b_url"])).toBe(false)
    })

    it("returns true for both empty and false for case mismatch", () => {
        expect(urls_have_same_order([], [])).toBe(true)
        expect(urls_have_same_order(["A_url"], ["a_url"])).toBe(false)
    })
})
