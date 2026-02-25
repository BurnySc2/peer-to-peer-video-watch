import type { DataConnection } from "peerjs"
import * as z from "zod"

// Zod
const TempState = z.object({
	playlist: z.array(z.string()),
	playlist_index: z.number(),
	// May be different when catching up to other clients
	video_playback_speed: z.number(),
	video_target_playback_speed: z.number(),
	video_current_time: z.number(),
	// Max time of any connected client. If difference to current time is larger than threshold, try to catch up
	video_p2p_max_time: z.number(),
	video_state_paused: z.boolean(),
	// In sync with "oncanplay" event, will be false on load and when seeking
	video_can_play: z.boolean(),
	peer_connections: z.array(z.custom<DataConnection>()),
})

// Types
export type TTempState = z.infer<typeof TempState>

export const temp_state: TTempState = $state({
	playlist: [],
	playlist_index: 0,
	video_playback_speed: 1,
	video_target_playback_speed: 1,
	video_current_time: 0,
	video_p2p_max_time: 0,
	video_state_paused: true,
	video_can_play: false,
	peer_connections: [],
})
