import type { DataConnection } from "peerjs"
import * as z from "zod"

// Zod
export const PlayListItem = z.object({
    url: z.string(),
    video_title: z.string(),
    subtitles_original_url: z.string(),
})
const TempState = z.object({
    playlist: z.array(PlayListItem),
    playlist_index: z.number(),
    autoplay: z.boolean(),
    ready_peers: z.set(z.string()),
    peer_connections: z.array(z.custom<DataConnection>()),
    subtitles: z.object({
        enabled: z.boolean(),
        blob_url: z.string(),
        offset: z.number(),
    }),
    // May be different when catching up to other clients
    video_playback_speed: z.number(),
    // Use 'video_target_playback_speed' as goal, but use 'video_playback_speed' to catch up
    video_target_playback_speed: z.number(),
    // Max time of any connected client. If difference to current time is larger than threshold, try to catch up
    video_p2p_max_time: z.number(),
    // Video player data
    video_current_time: z.number(),
    video_duration: z.number(),
    video_state_paused: z.boolean(),
    // In sync with "oncanplay" event, will be false on load and when seeking
    video_can_play: z.boolean(),
    video_element: z.custom<HTMLVideoElement | null>(),
    video_title: z.string(),
})

// Types
export type TTempState = z.infer<typeof TempState>
export type TPlayListItem = z.infer<typeof PlayListItem>

export const temp_state: TTempState = $state({
    playlist: [],
    playlist_index: -1,
    autoplay: false,
    ready_peers: new Set<string>(),
    peer_connections: [],
    subtitles: {
        enabled: false,
        blob_url: "",
        offset: 0,
    },
    video_playback_speed: 1,
    video_target_playback_speed: 1,
    video_p2p_max_time: 0,
    video_current_time: 0,
    video_duration: 0,
    video_state_paused: true,
    video_can_play: false,
    video_element: null,
    video_title: "",
})
