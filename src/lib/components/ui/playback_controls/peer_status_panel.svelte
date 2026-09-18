<script lang="ts">
import { onMount } from "svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import PeerStatusRow from "../PeerStatusRow.svelte"
import { peer_age_seconds, peer_status_for } from "./peer_status_helpers"

let now = $state(0)
onMount(() => {
    const interval = setInterval(() => {
        now = Date.now()
    }, 1000)

    return () => clearInterval(interval)
})
</script>

<div class="col-start-5 row-span-2 items-center border border-gray-600 rounded text-center">
    <div class="flex flex-col h-full">
        <div class="py-1">Peer status</div>
        <div class="border-t border-gray-600 p-1 flex-1 text-center">
            {#each Object.entries(temp_state.peer_connections) as [peer_id, meta]}
                {@const age = peer_age_seconds(now, meta.last_seen)}
                {@const status = peer_status_for(age)}
                <div
                    data-peer-age={age}
                    data-peer-status={status}
                    class="contents"
                >
                    <PeerStatusRow
                        {peer_id}
                        last_seen={meta.last_seen}
                        {now}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>
