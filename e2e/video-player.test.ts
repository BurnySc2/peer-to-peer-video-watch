// npx playwright test video-player.test.ts
// npx playwright test -g "video-player"
// npx playwright test --ui

import { expect, test } from "@playwright/test"

test("video-player initial state", async ({ page }) => {
    await page.goto("/video-player")

    // Check visible items
    await test.step("initial visible UI", async () => {
        await expect(page.getByText("Enter a link below to begin...")).toBeVisible()
        await expect(page.getByText("Current playlist empty")).toBeVisible()
        await expect(page.getByPlaceholder("New playlist item")).toBeVisible()
        await expect(page.getByText("Add to playlist")).toBeVisible()
    })

    // Check video and rest of controls are hidden from DOM
    await test.step("initially video controls not present", async () => {
        await expect(page.locator("video")).toHaveCount(0)
        await expect(page.getByText("Playback rate")).not.toBeAttached()
        await expect(page.getByText("Volume")).not.toBeAttached()
        await expect(page.getByText("Subs offset")).not.toBeAttached()
        await expect(page.getByText("Subs size")).not.toBeAttached()
        await expect(page.getByText("Autoplay")).not.toBeAttached()
        await expect(page.getByText("Add emote")).not.toBeAttached()
        await expect(page.getByText("Sleep timer")).not.toBeAttached()
    })
})
