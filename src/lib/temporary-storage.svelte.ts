import * as z from "zod"

const TempState = z.object({
	playlist: z.array(z.string()),
	playlist_index: z.number(),
	// May be different when catching up to other clients
	video_playback_speed: z.number(),
	video_target_playback_speed: z.number(),
	video_current_time: z.number(),
	video_state: z.union([z.literal("playing"), z.literal("paused")]),
})

export type TTempState = z.infer<typeof TempState>

export const temp_state: TTempState = $state({
	playlist: [],
	playlist_index: 0,
	video_playback_speed: 1,
	video_target_playback_speed: 1,
	video_current_time: 0,
	video_state: "paused",
})
