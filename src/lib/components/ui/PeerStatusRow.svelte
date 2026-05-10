<script lang="ts">
interface Props {
    peer_id: string
    last_seen: number
    now: number
}

let { peer_id, last_seen, now }: Props = $props()

let age = $derived(1 + Math.floor((now - last_seen) / 1000))
let status = $derived(age < 6 ? "green" : age < 11 ? "orange" : "red")
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
