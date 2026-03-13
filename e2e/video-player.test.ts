// npx playwright test video-player.test.ts
// npx playwright test -g "video-player"
// npx playwright test --ui

import { expect, test } from "@playwright/test"

const TEST_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
const TEST_VIDEO_LENGTH = "9:56"

test("video-player initial state", async ({ page }) => {
    await page.goto("/video-player")

    // Check visible items
    await test.step("initial visible UI", async () => {
        await expect(page.getByText(/enter a link below to begin.../i)).toBeVisible()
        await expect(page.getByText(/current playlist empty/i)).toBeVisible()
        await expect(page.getByPlaceholder(/new playlist item/i)).toBeVisible()
        await expect(page.getByText(/add to playlist/i)).toBeVisible()
        await expect(page.getByText(/current playlist empty/i)).toBeVisible()
    })

    // Check video and rest of controls are hidden from DOM
    await test.step("initially video controls not present", async () => {
        await expect(page.locator("video")).toHaveCount(0)
        await expect(page.getByText(/playback rate/i)).not.toBeAttached()
        await expect(page.getByText(/volume/i)).not.toBeAttached()
        await expect(page.getByText(/subs offset/i)).not.toBeAttached()
        await expect(page.getByText(/subs size/i)).not.toBeAttached()
        await expect(page.getByText(/autoplay/i)).not.toBeAttached()
        await expect(page.getByText(/add emote/i)).not.toBeAttached()
        await expect(page.getByText(/sleep timer/i)).not.toBeAttached()
    })
})

// npx playwright test -g "video-player load"
test("video-player load video into playlist", async ({ page }) => {
    await page.goto("/video-player")

    await test.step("add video to playlist", async () => {
        // Adds url into playlist
        await page.getByPlaceholder(/new playlist item/i).fill(TEST_VIDEO_URL)
        await page.getByRole("button", { name: /add to playlist/i }).click()
        // Input box clears
        await expect(page.getByPlaceholder(/new playlist item/i)).toHaveValue("")
        // URL added to playlist
        await expect(page.getByRole("option", { name: TEST_VIDEO_URL })).toBeVisible()

        // Video element is now visible
        await expect(page.locator("video")).toBeVisible()
    })

    const video = page.locator("video")
    await test.step("lower video controls now visible", async () => {
        await expect(page.getByText(/playback rate/i)).toBeVisible()
        await expect(page.getByText(/volume/i)).toBeVisible()
        await expect(page.getByText(/subs offset/i)).toBeVisible()
        await expect(page.getByText(/subs size/i)).toBeVisible()
        await expect(page.getByText(/autoplay/i)).toBeVisible()
        await expect(page.getByText(/add emote/i)).toBeVisible()
        await expect(page.getByText(/sleep timer/i)).toBeVisible()
    })

    // Can use TestId for more specificity, since "play"-like button exists in other areas
    await test.step("in video controls to be visible", async () => {
        await expect(page.getByTestId("player-play")).toBeVisible()
        await expect(page.getByRole("button", { name: /seek back/i })).toBeVisible()
        await expect(page.getByRole("button", { name: /seek forward/i })).toBeVisible()
        await expect(page.getByRole("button", { name: /fullscreen/i })).toBeVisible()
        await expect(page.getByTestId("current-time")).toHaveText("0:00")
        await expect(page.getByTestId("total-time")).toHaveText(TEST_VIDEO_LENGTH)
    })

    await test.step("in video controls work", async () => {
        // Seek forward
        await page.getByTestId("seek-forward").click({ clickCount: 3 })
        await expect(page.getByTestId("current-time")).toHaveText("0:30")

        // Seek back
        await page.getByTestId("seek-back").click({ clickCount: 3 })
        await expect(page.getByTestId("current-time")).toHaveText("0:00")

        // Play
        await page.getByTestId("player-play").click()
        const paused = await video.evaluate((v: HTMLVideoElement) => v.paused)
        expect(paused).toBe(false)

        // Pause, JSProperty version waits better, but evaluate allows more complex computations
        await page.getByTestId("player-pause").click()
        await expect(video).toHaveJSProperty("paused", true)
    })
})

test("p2p video sync", async ({ browser }) => {
    // Define host as 1
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()

    // Define member as 2
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()

    // Host creates a room
    await page1.goto("/rooms")
    await page1.getByRole("button", { name: /create room/i }).click()

    // Wait until room redirect happens
    await page1.waitForFunction(() => window.location.href.includes("?room_id="))
    const room_url = await page1.evaluate(() => window.location.href)

    // Member joins room (NB Checking for toasts doesn't work well since playwright polling can miss it)
    await page2.goto(room_url)
    await expect(page2.getByText(/enter a link below to begin.../i)).toBeVisible()

    // Host adds vid to playlist
    await page1.getByPlaceholder(/new playlist item/i).fill(TEST_VIDEO_URL)
    await page1.getByRole("button", { name: /add to playlist/i }).click()

    // Member sees vid in playlist
    await expect(page2.getByRole("option", { name: TEST_VIDEO_URL })).toBeVisible()

    // Video loads for both
    await expect(page1.locator("video")).toBeVisible()
    await expect(page2.locator("video")).toBeVisible()
    const video1 = page1.locator("video")
    const video2 = page2.locator("video")

    // Host presses seek forward
    await page1.getByTestId("seek-forward").click({ clickCount: 2 })
    await expect(page2.getByTestId("current-time")).toHaveText(/0:20|0:21/)

    // Host presses play, member video plays --- might break if browser autoplay disallowed
    await page1.getByTestId("player-play").click()
    await expect(video2).toHaveJSProperty("paused", false)

    // Member presses pause, host pauses
    await page2.getByTestId("player-pause").click()
    await expect(video1).toHaveJSProperty("paused", true)

    // Host presses seek back
    await page1.getByTestId("seek-back").click({ clickCount: 3 })
    await expect(page2.getByTestId("current-time")).toHaveText("0:00")
})
