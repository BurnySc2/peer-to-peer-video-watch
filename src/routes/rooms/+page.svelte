<script lang="ts">
import { onMount } from "svelte"
import Navigation from "$lib/components/Navigation.svelte"
import Rooms from "$lib/components/ui/Rooms.svelte"
import { teardown_room } from "$lib/peer_handling/peer_teardown.svelte"

onMount(() => {
    // Full wipe when entering room list (disconnect peers, clear playlist/temp, unload peer id)
    teardown_room(null)
})
</script>

<Navigation />
<Rooms />
