import * as z from "zod"

export const SetupOptions = z.object({
    send_init: z.boolean(),
})

export const PlayListItem = z.object({
    url: z.string(),
    video_title: z.string(),
    subtitles_original_url: z.string(),
})

export const Message = z.union([
    z.object({
        type: z.literal("init_connect"),
        peer_ids: z.array(z.string()),
        playlist: z.array(PlayListItem),
        // Currently playing
        playlist_index: z.number(),
        video_target_playback_speed: z.number(),
        video_current_time: z.number(),
        video_state_paused: z.boolean(),
    }),
    // Set new playlist (triggered by adding or removing an item)
    z.object({
        type: z.literal("playlist_set"),
        playlist: z.array(PlayListItem),
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
])

export type TPlayListItem = z.infer<typeof PlayListItem>
export type TSetupOptions = z.infer<typeof SetupOptions>
export type TMessage = z.infer<typeof Message>
