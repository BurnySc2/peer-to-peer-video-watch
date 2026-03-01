<script lang="ts">
import toast from "svelte-5-french-toast"
import { APP_CONFIG } from "$lib/config"
import { p2p_send_ready } from "$lib/peer_handling/peer_send.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"

interface Props {
    send_video_play?: (time: number) => void
}

let {
    send_video_play = (time: number) => {
        console.log("Sending video_play", time)
    },
}: Props = $props()

function local_set_play() {
    if (temp_state.video_state_paused) {
        temp_state.video_state_paused = false
        send_video_play(temp_state.video_current_time)
    }
}

let ready_check_active = $state(false)
let ready_check_timer: ReturnType<typeof setTimeout> | null = null
function handle_ready_check() {
    if (ready_check_active) return

    ready_check_active = true

    ready_check_timer = setTimeout(() => {
        console.log("Ready check ended")

        ready_check_active = false
        ready_check_timer = null
        if (temp_state.ready_peers.size - 1 < temp_state.peer_connections.length) {
            console.log("Peers not ready")
            toast("Peers not ready")
        }
        temp_state.ready_peers = new Set()
    }, APP_CONFIG.ready_check_delay_ms)
}

function handle_ready_success() {
    if (ready_check_active === true) {
        console.log("Ready check success")
        toast.success("Peers ready", { position: APP_CONFIG.toast_location })
        ready_check_active = false
        local_set_play()
    }
}

$effect(() => {
    if (temp_state.ready_peers.size - 1 >= temp_state.peer_connections.length) {
        handle_ready_success()
    } else if (temp_state.ready_peers.size > 0) {
        console.log("Handle ready check")
        handle_ready_check()
    }
})
</script>

{#if ready_check_active}
    <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
         w-56 bg-white text-black rounded-2xl shadow-2xl
         border border-gray-200 p-5 flex flex-col gap-4"
    >
        <h2 class="text-xl font-bold text-center">Ready Check</h2>

        <div class="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            <ul class="space-y-1 text-sm">
                <li class="flex justify-between">
                    <span>You</span>
                    {#if temp_state.ready_peers.has(perma_state.global_settings.peer_id)}
                        <span class="text-green-600 font-semibold">✅</span>
                    {:else}
                        <span class="text-green-600 font-semibold">⏳</span>
                    {/if}
                </li>

                {#each temp_state.peer_connections as con, i (con.peer)}
                    <li
                        id={con.peer}
                        class="flex justify-between text-gray-700"
                    >
                        <span>Peer {i + 1}</span>
                        {#if temp_state.ready_peers.has(con.peer)}
                            <span>✅</span>
                        {:else}
                            <span class="text-green-600 font-semibold">⏳</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>

        <div class="flex">
            {#if temp_state.ready_peers.has(perma_state.global_settings.peer_id)}
                <div
                    class="flex-1 p-2 rounded-lg bg-green-800 text-white
        font-semibold"
                >
                    Waiting for peers...
                </div>
            {:else}
                <button
                    onclick={p2p_send_ready}
                    class="flex-1 py-2 rounded-lg bg-green-600 text-white
        font-semibold hover:bg-green-700 active:bg-green-800
        transition"
                >
                    Go
                </button>
            {/if}
        </div>
    </div>
{/if}
