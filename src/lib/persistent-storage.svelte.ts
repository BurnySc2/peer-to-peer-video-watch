import * as z from "zod"
import { browser } from "$app/environment"

// Zod
const GlobalSettings = z
	.object({
		loading: z.boolean(),
		volume: z.number(),
	})
	.catch({
		loading: false,
		volume: 0.5,
	})
const RoomData = z.object({ loading: z.boolean() }).catch({
	loading: false,
})

const PermaState = z.object({
	global_settings: GlobalSettings,
	room_data: RoomData,
})

// Types
export type TGlobalSettings = z.infer<typeof GlobalSettings>
export type TRoomData = z.infer<typeof RoomData>
export type TPermaState = z.infer<typeof PermaState>

// Permanent settings here
// TODO: Volume
// TODO: Room info - playlist, current index, current video time and playback speed

export const perma_state = $state<TPermaState>({
	global_settings: {
		loading: true,
		volume: 0.5,
	},
	room_data: {
		loading: true,
	},
})

$effect.root(() => {
	// Global settings
	$effect.pre(() => {
		// Save data
		if (browser && !perma_state.global_settings.loading) {
			localStorage.setItem("vodching_global_settings", JSON.stringify(perma_state.global_settings))
		}
		// Load data
		if (browser && perma_state.global_settings.loading) {
			perma_state.global_settings.loading = false
			const data = localStorage.getItem("vodching_global_settings")
			if (data !== null) {
				perma_state.global_settings = {
					// Set default
					...perma_state.global_settings,
					// Set loaded values
					// TODO: Load using zod instead
					...PermaState.parse(JSON.parse(data)),
				}
			}
		}
		$state.snapshot(perma_state.global_settings)
	})
	// Room data
	$effect.pre(() => {
		// Save data
		if (browser && !perma_state.room_data.loading) {
			localStorage.setItem("vodching_room_data", JSON.stringify(perma_state.room_data))
		}
		// Load data
		if (browser && perma_state.room_data.loading) {
			perma_state.room_data.loading = false
			const data = localStorage.getItem("vodching_room_data")
			if (data !== null) {
				perma_state.room_data = {
					// Set default
					...perma_state.room_data,
					// Set loaded values
					// TODO: Load using zod instead
					...RoomData.parse(JSON.parse(data)),
				}
			}
		}
		$state.snapshot(perma_state.room_data)
	})
})
