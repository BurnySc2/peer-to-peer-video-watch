import * as z from "zod"

// Canonical single source; inferred type stays `number` (min(0) runtime only).
export const PlayListItemSchema = z.object({
    url: z.string(),
    video_title: z.string(),
    subtitles_original_url: z.string(),
    played_progress: z.number().min(0),
    played_complete: z.boolean(),
})

export type PlayListItem = z.infer<typeof PlayListItemSchema>

export const SetupOptions = z.object({
    send_init: z.boolean(),
})

export const Message = z.union([
    z.object({
        type: z.literal("init_connect"),
        peer_ids: z.array(z.string()),
        playlist: z.array(PlayListItemSchema),
        // Currently playing
        playlist_index: z.number(),
        video_target_playback_speed: z.number(),
        video_current_time: z.number(),
        video_state_paused: z.boolean(),
    }),
    z.object({
        type: z.literal("request_init"),
    }),
    // Set new playlist (triggered by adding or removing an item)
    z.object({
        type: z.literal("playlist_set"),
        playlist: z.array(PlayListItemSchema),
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
        type: z.literal("video_current_time_interval"),
        time: z.number(),
        timestamp_now: z.number(),
    }),
    z.object({
        type: z.literal("start_ready_check"),
        peer_id: z.string(),
    }),
    z.object({
        type: z.literal("send_ready"),
        peer_id: z.string(),
    }),
    z.object({
        type: z.literal("send_subtitle_offset"),
        subtitle_offset: z.number(),
    }),
    z.object({
        type: z.literal("send_emote"),
        id: z.string(),
        emote: z.string(),
    }),
    z.object({
        type: z.literal("send_ping"),
        peer_id: z.string(),
    }),
])

export type TSetupOptions = z.infer<typeof SetupOptions>
export type TMessage = z.infer<typeof Message>
