<script lang="ts">
import { onDestroy } from "svelte"
import { peer_count, temp_state } from "$lib/temporary-storage.svelte"
import { next_sleep_remaining, should_trigger_sleep } from "./sleep_timer_helpers"

let remaining = $state(0)
let timer: ReturnType<typeof setInterval> | undefined

// Sleep timer - does not broadcast pause
function set_sleep_timer(sleep_time: number) {
    if (timer) {
        clearInterval(timer)
        timer = undefined
    }
    const next = next_sleep_remaining(sleep_time)
    if (next <= 0) {
        remaining = 0
        return
    }

    console.log("Starting sleep timer")
    remaining = next
    timer = setInterval(() => {
        remaining -= 1
        if (should_trigger_sleep(remaining)) {
            if (timer) {
                clearInterval(timer)
            }
            timer = undefined
            temp_state.video_state_paused = true
            temp_state.is_sleeping = true
            if (peer_count()) {
                // Client is sleeping, don't ask peers for readycheck for next video
                temp_state.autoplay = false
            }
            console.log("Sleep timer triggered")
            return
        }
    }, 60000)
}

onDestroy(() => {
    if (timer) {
        clearInterval(timer)
    }
})
</script>

<div class="flex flex-col border border-gray-600 rounded">
    <label
        class="text-center"
        for="sleep_timer"
        >{remaining ? `Sleep timer active` : "Sleep timer (mins)"}</label
    >
    <input
        type="number"
        class="border-t border-gray-600 p-1 text-center select-none"
        id="sleep_timer"
        step="5"
        value={remaining}
        oninput={(e) => {
            set_sleep_timer(Number((e.target as HTMLInputElement).value))
        }}
    >
</div>
