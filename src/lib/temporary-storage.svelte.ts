import type { DataConnection } from "peerjs"
import * as z from "zod"

// Zod
const TempState = z.object({
    playlist: z.array(
        z.object({
            url: z.string(),
            video_title: z.string(),
            subtitles_original_url: z.string(),
        }),
    ),
    playlist_index: z.number(),
    ready_peers: z.set(z.string()),
    subtitles_enabled: z.boolean(),
    subtitles_blob_url: z.string(),
    subtitles_offset: z.number(),
    // May be different when catching up to other clients
    video_playback_speed: z.number(),
    // TODO: Use 'video_target_playback_speed' as goal, but use 'video_playback_speed' to catch up
    video_target_playback_speed: z.number(),
    video_current_time: z.number(),
    // Max time of any connected client. If difference to current time is larger than threshold, try to catch up
    video_p2p_max_time: z.number(),
    video_state_paused: z.boolean(),
    // In sync with "oncanplay" event, will be false on load and when seeking
    video_can_play: z.boolean(),
    peer_connections: z.array(z.custom<DataConnection>()),
    video_element: z.custom<HTMLVideoElement | null>(),
    video_duration: z.number(),
    video_title: z.string(),
})

// Types
export type TTempState = z.infer<typeof TempState>

export const temp_state: TTempState = $state({
    playlist: [],
    playlist_index: 0,
    ready_peers: new Set<string>(),
    subtitles_enabled: false,
    subtitles_blob_url: "",
    subtitles_offset: 0,
    video_playback_speed: 1,
    video_target_playback_speed: 1,
    video_current_time: 0,
    video_p2p_max_time: 0,
    video_state_paused: true,
    video_can_play: false,
    peer_connections: [],
    video_element: null,
    video_duration: 0,
    video_title: "",
})
