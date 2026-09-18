<script lang="ts">
import { peer_age_seconds, peer_status_for } from "./playback_controls/peer_status_helpers"

interface Props {
    peer_id: string
    last_seen: number
    now: number
}

let { peer_id, last_seen, now }: Props = $props()

let age = $derived(peer_age_seconds(now, last_seen))
let status = $derived(peer_status_for(age))
</script>

<div class="flex w-full items-center gap-2 justify-center">
    <span title={peer_id}>{peer_id.slice(-4)}</span>
    <div
        title={`Last seen ${age}s ago`}
        class={`w-2 h-2 rounded-full ${
            status === "green" ? "bg-green-500" :
            status === "orange" ? "bg-orange-500" :
            "bg-red-500"
        }`}
    ></div>
</div>
