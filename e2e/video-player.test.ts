// npx playwright test video-player.test.ts
// npx playwright test -g "video-player"
// npx playwright test --ui

import { type Browser, type BrowserContext, expect, type Locator, type Page, test } from "@playwright/test"

type VIDEO_OBJ = {
    URL: string
    LENGTH_FORMATTED: string
    LENGTH_S: number
}

const TEST_VIDEO_1 = {
    URL: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    LENGTH_FORMATTED: "9:56",
    LENGTH_S: 596.474195,
}

const TEST_VIDEO_2 = {
    URL: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    LENGTH_FORMATTED: "0:05",
    LENGTH_S: 5.055,
}

// ============================================================================
// Helper Functions
// ============================================================================

// Seek slider manipulation helper - avoids duplicating this code across tests
async function seek_video_to(page: Page, targetSeconds: number) {
    const slider = page.getByTestId("seek-slider")
    await slider.evaluate((el, value) => {
        const input = el as HTMLInputElement
        input.valueAsNumber = value
        input.dispatchEvent(new InputEvent("input", { bubbles: true }))
    }, targetSeconds)
}

async function get_video_duration(video: Locator) {
    return video.evaluate((v: HTMLVideoElement) => v.duration)
}

async function add_video_to_playlist(page: Page, video_obj: VIDEO_OBJ) {
    await page.getByPlaceholder(/new playlist item/i).fill(video_obj.URL)
    await page.getByRole("button", { name: /add to playlist/i }).click()
    await expect(page.getByPlaceholder(/new playlist item/i)).toHaveValue("")
    await expect(page.getByRole("option", { name: video_obj.URL })).toBeVisible()
    await expect(page.locator("video")).toBeVisible()
}

async function setup_p2p_room(browser: Browser) {
    // Host creates a room
    const host_context = await browser.newContext()
    const host_page = await host_context.newPage()
    await host_page.goto("/rooms")
    await host_page.getByRole("button", { name: /create room/i }).click()

    // Wait until room redirect happens
    await host_page.waitForFunction(() => window.location.href.includes("?room_id="))
    const room_url = await host_page.evaluate(() => window.location.href)

    // Member joins room with empty playlist
    const member_context = await browser.newContext()
    const member_page = await member_context.newPage()
    await member_page.goto(room_url)
    await expect(member_page.getByText(/enter a link below to begin.../i)).toBeVisible()

    return {
        room_url,
        host_page,
        host_context,
        member_page,
        member_context,
    }
}

// ============================================================================
// Solo Video Player Tests
// ============================================================================

test.describe("solo video player", () => {
    test("initial page state", async ({ page }) => {
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

    test("main controls", async ({ page }) => {
        await page.goto("/video-player")

        await test.step("add video to playlist", async () => {
            // Adds url into playlist
            await page.getByPlaceholder(/new playlist item/i).fill(TEST_VIDEO_1.URL)
            await page.getByRole("button", { name: /add to playlist/i }).click()
            // Input box clears
            await expect(page.getByPlaceholder(/new playlist item/i)).toHaveValue("")
            // URL added to playlist
            await expect(page.getByRole("option", { name: TEST_VIDEO_1.URL })).toBeVisible()

            // Video element is now visible
            await expect(page.locator("video")).toBeVisible()
        })

        const video = page.locator("video")
        await expect(video).toHaveJSProperty("duration", TEST_VIDEO_1.LENGTH_S)
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
            await expect(page.getByTestId("total-time")).toHaveText(TEST_VIDEO_1.LENGTH_FORMATTED)
        })

        await test.step("in video controls work", async () => {
            // Seek forward
            await page.getByTestId("seek-forward").click({ clickCount: 3 })
            await expect(page.getByTestId("current-time")).toHaveText("0:30")
            await expect(video).toHaveJSProperty("currentTime", 30)

            // Seek back
            await page.getByTestId("seek-back").click({ clickCount: 3 })
            await expect(page.getByTestId("current-time")).toHaveText("0:00")
            await expect(video).toHaveJSProperty("currentTime", 0)

            // Play
            await page.getByTestId("player-play").click()
            const paused = await video.evaluate((v: HTMLVideoElement) => v.paused)
            expect(paused).toBe(false)

            // Pause, JSProperty version waits better, but evaluate allows more complex computations
            await page.getByTestId("player-pause").click()
            await expect(video).toHaveJSProperty("paused", true)
        })
        await test.step("playback speed increase", async () => {
            await page.selectOption("#playback_speed", "1.5")
            await expect(video).toHaveJSProperty("playbackRate", 1.5)
        })
        await test.step("playback speed decrease", async () => {
            await page.selectOption("#playback_speed", "1")
            await expect(video).toHaveJSProperty("playbackRate", 1)
        })
    })

    test("autoplay", async ({ page }) => {
        await page.goto("/video-player")

        await test.step("add video_1 to playlist", async () => {
            await add_video_to_playlist(page, TEST_VIDEO_1)
        })
        // Adding first video to playlist loads the video element
        const video = page.locator("video")

        await test.step("add video_2 to playlist", async () => {
            await add_video_to_playlist(page, TEST_VIDEO_2)
        })

        // Let video first frame load or autoplay will trigger for itself (not a problem for users)
        await expect(video).toBeVisible()
        await expect(video).toHaveJSProperty("readyState", 4)

        await test.step("enable autoplay", async () => {
            await page.getByPlaceholder(/new playlist item/i).fill(TEST_VIDEO_2.URL)
            await page.getByRole("checkbox", { name: /autoplay/i }).check()
            await expect(page.getByRole("checkbox", { name: /autoplay/i })).toBeChecked()
        })

        // Increase video speed to test that playback speed continues after autoplay
        await test.step("playback speed increase", async () => {
            await page.selectOption("#playback_speed", "1.5")
            await expect(video).toHaveJSProperty("playbackRate", 1.5)
        })

        // Seek towards end of video to test autoplay is working
        const target = (await get_video_duration(video)) - 2
        await test.step("seek close to end of first video", async () => {
            await seek_video_to(page, target)
        })

        await test.step("check seek success, play and next vid autoplays with correct speed", async () => {
            // Play
            await page.getByTestId("player-play").click()
            const paused = await video.evaluate((v: HTMLVideoElement) => v.paused)
            expect(paused).toBe(false)

            // Check vid has actually seeked close to end
            await expect
                .poll(async () => await video.evaluate((v: HTMLVideoElement) => v.currentTime))
                .toBeGreaterThanOrEqual(target)

            // Check next vid in playlist plays
            await expect.poll(async () => video.evaluate((v: HTMLVideoElement) => v.src)).toBe(TEST_VIDEO_2.URL)

            // Check vid still has 1.5 playback rate
            await expect(video).toHaveJSProperty("playbackRate", 1.5)
        })
    })
})

// ============================================================================
// P2P Video Player Tests
// ============================================================================

test.describe("p2p video player", () => {
    // Shared state for P2P tests - set up once per test
    let host_page: Page
    let member_page: Page
    let host_context: BrowserContext
    let member_context: BrowserContext

    test.beforeEach(async ({ browser }) => {
        const setup = await setup_p2p_room(browser)
        host_page = setup.host_page
        member_page = setup.member_page
        host_context = setup.host_context
        member_context = setup.member_context
    })

    test.afterEach(async () => {
        // Clean up browser contexts to prevent resource leaks
        await Promise.allSettled([host_context?.close(), member_context?.close()])
    })

    test("room setup", async () => {
        // Host adds vid to playlist
        await host_page.getByPlaceholder(/new playlist item/i).fill(TEST_VIDEO_1.URL)
        await host_page.getByRole("button", { name: /add to playlist/i }).click()

        // Member sees vid in playlist
        await expect(member_page.getByRole("option", { name: TEST_VIDEO_1.URL })).toBeVisible()
    })

    test("join room in progress", async ({ browser }) => {
        const setup = await setup_p2p_room(browser)
        const host_p = setup.host_page
        const member_p = setup.member_page

        // Host adds vids to playlist, first video loads
        await add_video_to_playlist(host_p, TEST_VIDEO_1)
        await add_video_to_playlist(host_p, TEST_VIDEO_2)
        await expect(host_p.locator("video")).toBeVisible()

        // Member joins room and sees video (NB Checking for toasts doesn't work well since playwright polling can miss it)
        await member_p.goto(setup.room_url)
        await expect(member_p.locator("video")).toBeVisible()
        const video_page2 = member_p.locator("video")
        await expect(video_page2).toHaveJSProperty("src", TEST_VIDEO_1.URL)

        // Member sees vids in playlist
        await expect(member_p.getByRole("option", { name: TEST_VIDEO_1.URL })).toBeVisible()
        await expect(member_p.getByRole("option", { name: TEST_VIDEO_2.URL })).toBeVisible()

        // Clean up this specific test's contexts
        await Promise.allSettled([setup.host_context.close(), setup.member_context.close()])
    })

    test("sync controls", async () => {
        // Host adds vid to playlist
        await host_page.getByPlaceholder(/new playlist item/i).fill(TEST_VIDEO_1.URL)
        await host_page.getByRole("button", { name: /add to playlist/i }).click()

        // Member sees vid in playlist
        await expect(member_page.getByRole("option", { name: TEST_VIDEO_1.URL })).toBeVisible()

        // Video loads for both
        await expect(host_page.locator("video")).toBeVisible()
        await expect(member_page.locator("video")).toBeVisible()
        const video1 = host_page.locator("video")
        const video2 = member_page.locator("video")

        // Host presses seek forward
        await host_page.getByTestId("seek-forward").click({ clickCount: 2 })
        await expect(member_page.getByTestId("current-time")).toHaveText(/0:20|0:21/)

        // Host presses play, member video plays --- might break if browser autoplay disallowed
        await host_page.getByTestId("player-play").click()
        await expect(video2).toHaveJSProperty("paused", false)

        // Member presses pause, host pauses
        await member_page.getByTestId("player-pause").click()
        await expect(video1).toHaveJSProperty("paused", true)

        // Host presses seek back
        await host_page.getByTestId("seek-back").click({ clickCount: 3 })
        await expect(member_page.getByTestId("current-time")).toHaveText("0:00")

        // Member increases playback rate, use poll to check all values at once
        await member_page.selectOption("#playback_speed", "2")
        await expect
            .poll(async () => ({
                v1: await video1.evaluate((v: HTMLVideoElement) => v.playbackRate),
                v2: await video2.evaluate((v: HTMLVideoElement) => v.playbackRate),
                s1: await host_page.locator("#playback_speed").inputValue(),
                s2: await member_page.locator("#playback_speed").inputValue(),
            }))
            .toEqual({
                v1: 2,
                v2: 2,
                s1: "2",
                s2: "2",
            })

        // Host decreases playback rate
        await host_page.selectOption("#playback_speed", "1")
        await expect
            .poll(async () => ({
                v1: await video1.evaluate((v: HTMLVideoElement) => v.playbackRate),
                v2: await video2.evaluate((v: HTMLVideoElement) => v.playbackRate),
                s1: await host_page.locator("#playback_speed").inputValue(),
                s2: await member_page.locator("#playback_speed").inputValue(),
            }))
            .toEqual({
                v1: 1,
                v2: 1,
                s1: "1",
                s2: "1",
            })
    })

    test("member reconnects", async () => {
        await add_video_to_playlist(host_page, TEST_VIDEO_1)
        const video_host = host_page.locator("video")
        const video_member = member_page.locator("video")

        await expect(video_host).toHaveJSProperty("paused", true)
        await expect(video_member).toHaveJSProperty("paused", true)

        // Seek video to 30s
        const target = 30
        await seek_video_to(host_page, target)

        // Host and member both seek correctly
        await expect
            .poll(async () => await video_host.evaluate((v: HTMLVideoElement) => v.currentTime))
            .toBeGreaterThanOrEqual(target)

        await expect
            .poll(async () => await video_member.evaluate((v: HTMLVideoElement) => v.currentTime))
            .toBeGreaterThanOrEqual(target)

        // Member refreshes page (waituntil: networkidle - might not work here since video is loading)
        await member_page.reload({ waitUntil: "load" })

        // Members reloads video at correct time
        await expect
            .poll(async () => await video_member.evaluate((v: HTMLVideoElement) => v.currentTime))
            .toBeGreaterThanOrEqual(target)

        // Member is still part of the group - host presses play, member video plays
        await host_page.getByTestId("player-play").click()
        await expect(video_member).toHaveJSProperty("paused", false)
    })

    test("host reconnects", async () => {
        await add_video_to_playlist(host_page, TEST_VIDEO_1)
        const video_host = host_page.locator("video")
        const video_member = member_page.locator("video")

        await expect(video_host).toHaveJSProperty("paused", true)
        await expect(video_member).toHaveJSProperty("paused", true)

        // Seek video to 30s
        const target = 30
        await seek_video_to(host_page, target)

        // Host and member both seek correctly
        await expect
            .poll(async () => await video_host.evaluate((v: HTMLVideoElement) => v.currentTime))
            .toBeGreaterThanOrEqual(target)

        await expect
            .poll(async () => await video_member.evaluate((v: HTMLVideoElement) => v.currentTime))
            .toBeGreaterThanOrEqual(target)

        // Host refreshes page (waituntil: networkidle - might not work here since video is loading)
        await host_page.reload({ waitUntil: "load" })

        // Host reloads video at correct time
        await expect
            .poll(async () => await video_host.evaluate((v: HTMLVideoElement) => v.currentTime))
            .toBeGreaterThanOrEqual(target)

        // Host is still part of the group - host presses play, member video plays
        await host_page.getByTestId("player-play").click()
        await expect(video_member).toHaveJSProperty("paused", false)
    })

    test("ready check", async () => {
        // Safe to define before the video exists
        const video_host = host_page.locator("video")
        const video_member = member_page.locator("video")

        await test.step("set up room and load video", async () => {
            await add_video_to_playlist(host_page, TEST_VIDEO_1)

            // Video is paused initially
            await expect(video_host).toHaveJSProperty("paused", true)
            await expect(video_member).toHaveJSProperty("paused", true)
        })

        // Host sends ready check, host and member see it
        await test.step("send ready check, both see it", async () => {
            await host_page.getByTestId("ready-check").click()
            await expect(host_page.getByText(/waiting for peers/i)).toBeVisible()
            await expect(member_page.getByText(/ready check/i)).toBeVisible()

            // Check one peer is marked as ready, one is marked as waiting
            await expect(member_page.getByText("✅")).toHaveCount(1)
            await expect(member_page.getByText("⏳")).toHaveCount(1)
        })

        await test.step("member presses ready, both are ready, check ends and video plays", async () => {
            // Member presses ready
            await member_page.getByTestId("send-ready").click()

            // Ready check disappears for both
            await expect(host_page.getByText(/ready check/i)).not.toBeVisible()
            await expect(member_page.getByText(/ready check/i)).not.toBeVisible()

            // Video plays for both
            await expect(video_host).toHaveJSProperty("paused", false)
            await expect(video_member).toHaveJSProperty("paused", false)
        })
    })
})
