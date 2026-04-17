import { expect, test } from "@playwright/test"

const TEST_VIDEO = "http://localhost:4173/_tests/test_vid.mp4"

test.describe("persistent storage migration", () => {
    test("preserves_volume_and_updates_subtitles_font_size_rem_on_change", async ({ page }) => {
        await test.step("set old localStorage entry with volume instead of subtitles_font_size_rem", async () => {
            await page.addInitScript(() => {
                localStorage.setItem(
                    "vodching_global_settings",
                    JSON.stringify({
                        volume: 0.75,
                        subtitles_font_size_rem: 1.5,
                    }),
                )
            })
            await page.goto("/video-player")
        })

        await test.step("add video to playlist", async () => {
            await page.getByPlaceholder(/new playlist item/i).fill(TEST_VIDEO)
            await page.getByRole("button", { name: /add to playlist/i }).click()
            await expect(page.locator("video")).toBeVisible()
        })

        await test.step("change subtitles font size to trigger writeback", async () => {
            const subs_size_input = page.locator("#subtitle_font_size")
            await subs_size_input.fill("2")
            await subs_size_input.blur()
        })

        await test.step("verify localStorage has subtitles_font_size_rem instead of volume", async () => {
            const stored = await page.evaluate(() => {
                const data = localStorage.getItem("vodching_global_settings")
                return JSON.parse(data ?? "{}")
            })
            // Value from localstorage
            expect(stored.volume).toBeCloseTo(0.75, 2)
            // Value was just set
            expect(stored.subtitles_font_size_rem).toBe(2)
            // New values from zod
            expect(stored.peer_id).toBe("")
            expect(stored.personal_emotes).toEqual([])
            expect(stored.favourite_emotes).toEqual([])
        })
    })
})
