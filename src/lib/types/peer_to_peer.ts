import * as z from "zod"

export const SetupOptions = z.object({
	send_init: z.boolean(),
})

export const Message = z.union([
	z.object({
		type: z.literal("init_connect"),
		peer_ids: z.array(z.string()),
		playlist: z.array(z.string()),
		// Currently playing
		playlist_index: z.number(),
		video_target_playback_speed: z.number(),
		video_current_time: z.number(),
		video_state_paused: z.boolean(),
	}),
	// Set new playlist (triggered by adding or removing an item)
	z.object({
		type: z.literal("playlist_set"),
		playlist: z.array(z.string()),
		playlist_index: z.number(),
	}),
	z.object({
		type: z.literal("video_play"),
		time: z.number(),
	}),
	z.object({
		type: z.literal("video_pause"),
		time: z.number(),
	}),
	z.object({
		type: z.literal("video_seek_to"),
		time: z.number(),
	}),
	z.object({
		type: z.literal("video_set_playback_rate"),
		value: z.number(),
		time: z.number(),
	}),
	z.object({
		type: z.literal("video_current_time_sync"),
		value: z.number(),
		time: z.number(),
	}),
])

export type TSetupOptions = z.infer<typeof SetupOptions>
export type TMessage = z.infer<typeof Message>
