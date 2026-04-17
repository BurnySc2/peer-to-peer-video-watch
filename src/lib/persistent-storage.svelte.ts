import * as z from "zod"
import { browser } from "$app/environment"

// Zod
const GlobalSettings = z.object({
    peer_id: z.string().default(""),
    volume: z.number().default(0.5),
    subtitles_font_size_rem: z.number().default(1.25),
    recent_playlist_items: z
        .array(
            z.object({
                title: z.string(),
                url: z.string(),
            }),
        )
        .default([]),
    personal_emotes: z
        .array(
            z.object({
                name: z.string(),
                url: z.string(),
            }),
        )
        .default([]),
    favourite_emotes: z
        .array(
            z.object({
                name: z.string(),
                url: z.string(),
            }),
        )
        .default([]),
})
const RoomData = z.object({}).default({})

const PermaState = z.object({
    loading: z.object({
        global_settings: z.boolean(),
        room_data: z.boolean(),
    }),
    global_settings: GlobalSettings,
    room_data: RoomData,
})

// Types
export type TGlobalSettings = z.infer<typeof GlobalSettings>
export type TRoomData = z.infer<typeof RoomData>
export type TPermaState = z.infer<typeof PermaState>

export const PlayListItem = z.object({
    url: z.string(),
    video_title: z.string(),
    subtitles_original_url: z.string(),
})

// Permanent settings here
// TODO: Room info - playlist, current index, current video time and playback speed

export const perma_state = $state<TPermaState>({
    loading: {
        global_settings: true,
        room_data: true,
    },
    // Each value in GlobalSettings and RoomData should have a default
    global_settings: GlobalSettings.parse({}),
    room_data: RoomData.parse({}),
})

$effect.root(() => {
    // Global settings
    $effect(() => {
        // Save data
        if (browser && !perma_state.loading.global_settings) {
            localStorage.setItem("vodching_global_settings", JSON.stringify(perma_state.global_settings))
        }
        // Load data
        if (browser && perma_state.loading.global_settings) {
            perma_state.loading.global_settings = false
            const data = localStorage.getItem("vodching_global_settings")
            if (data !== null) {
                perma_state.global_settings = {
                    // Set default
                    ...perma_state.global_settings,
                    // Load using zod instead
                    ...GlobalSettings.parse(JSON.parse(data)),
                }
            }
        }
        $state.snapshot(perma_state.global_settings)
    })
    // Room data
    $effect(() => {
        // Save data
        if (browser && !perma_state.loading.room_data) {
            localStorage.setItem("vodching_room_data", JSON.stringify(perma_state.room_data))
        }
        // Load data
        if (browser && perma_state.loading.room_data) {
            perma_state.loading.room_data = false
            const data = localStorage.getItem("vodching_room_data")
            if (data !== null) {
                perma_state.room_data = {
                    // Set default
                    ...perma_state.room_data,
                    // Load using zod instead
                    ...RoomData.parse(JSON.parse(data)),
                }
            }
        }
        $state.snapshot(perma_state.room_data)
    })
})
