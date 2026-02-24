import * as z from "zod"

const Message = z.union([
	z.object({
		type: z.literal("init_connect"),
        peer_ids: z.array(z.string()),
		playlist: z.array(z.string()),
		// Currently playing
		playlist_index: z.number(),
		video_state: z.union([z.literal("playing"), z.literal("paused")]),
		video_current_time: z.number(),
	}),
	z.object({
		type: z.literal("playlist_set_current_playing"),
		value: z.number(),
	}),
	// Set new playlist (triggered by adding or removing an item)
	z.object({
		type: z.literal("playlist_set"),
		playlist: z.array(z.string()),
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
])

export type TMessage = z.infer<typeof Message>
