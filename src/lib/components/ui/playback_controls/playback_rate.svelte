<script lang="ts">
import { untrack } from "svelte"
import { peer_count, temp_state } from "$lib/temporary-storage.svelte"
import { PLAYBACK_SPEED_VALUES } from "$lib/types/video_player"

interface MyProps {
    send_video_set_playback_rate?: (message: { time: number; value: number }) => void
}
let {
    send_video_set_playback_rate = (message: { time: number; value: number }) => {
        console.log("Sending video_set_playback_rate", message.value)
    },
}: MyProps = $props()

$effect(() => {
    send_video_set_playback_rate({
        value: temp_state.video_target_playback_speed,
        time: untrack(() => temp_state.video_current_time),
    })
})
</script>

<div class="flex flex-col border border-gray-600 rounded">
    <label
        class="text-center p-1 select-none"
        for="playback_speed"
        >Playback rate</label
    >
    <select
        class="border-t border-gray-600 p-1 text-center"
        id="playback_speed"
        bind:value={
            () => temp_state.video_target_playback_speed,
            (v: number) => {
                temp_state.video_target_playback_speed = v
                if (!peer_count()) {
                    temp_state.video_playback_speed = v
                }
            }
        }
    >
        {#each PLAYBACK_SPEED_VALUES as ps}
            <option
                class="bg-gray-900"
                value={ps}
            >
                {ps}
            </option>
        {/each}
    </select>
</div>
