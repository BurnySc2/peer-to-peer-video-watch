<script lang="ts">
import { untrack } from "svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { TMessage } from "$lib/types/peer_to_peer"
import { PLAYBACK_SPEED_VALUES } from "$lib/types/video_player"

import PlayIcon from "$lib/icons/PlayIcon.svelte"
import PauseIcon from "$lib/icons/PauseIcon.svelte"
import BackIcon from "$lib/icons/BackIcon.svelte"
import ForwardIcon from "$lib/icons/ForwardIcon.svelte"
import FullscreenIcon from "$lib/icons/FullscreenIcon.svelte";

interface Props {
    onFullscreen: () => void
}

let { onFullscreen }: Props = $props()

function local_set_play_pause() {
	if (temp_state.video_state_paused) {
		temp_state.video_element?.play()
		// send_video_play(temp_state.video_current_time)
	} else {
		temp_state.video_element?.pause()
		// send_video_pause(temp_state.video_current_time)
	}
}

function seek_forward() {
    temp_state.video_current_time = temp_state.video_current_time + 10
}

function seek_back() {
    temp_state.video_current_time = temp_state.video_current_time - 10
}

// The parent container needs to be full screened, since the video controls are now separate
function full_screen() {
    temp_state.video_element?.requestFullscreen()
}

</script>

<div class="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex gap-2 w-full">
    <button onclick={local_set_play_pause}>
        {#if temp_state.video_state_paused}
        <PlayIcon />
        {:else}
        <PauseIcon />
        {/if}
    </button>
    <button onclick={seek_back}>
        <BackIcon />
    </button>
    <button onclick={seek_forward}>
        <ForwardIcon />
    </button>
    <!-- <input
        type="range"
        min="0"
        max={video_element?.duration || 0}
        step="0.01"
        value={video_element?.currentTime || 0}
        oninput={(e) => {
            if (video_element) {
                video_element.currentTime = e.target.value
            }
        }}
    /> -->
    <input
        type="range"
        class="w-full"
        min="0"
        max={temp_state.video_element?.duration}
        step="0.01"
        value={temp_state.video_current_time || 0}
        oninput={(e) => {
            temp_state.video_current_time = e.target.value
        }}
    />
    <button class="ml-auto" onclick={onFullscreen}>
        <FullscreenIcon />
    </button>
</div>