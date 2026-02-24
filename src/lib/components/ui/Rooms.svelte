<script lang="ts">
import { goto } from "$app/navigation"
import { perma_state } from "$lib/persistent-storage.svelte"

let input_room_id = $state("")

function reset_peer_id() {
	perma_state.global_settings.peer_id = ""
}
function create_room() {
	goto("/room")
}
function join_room() {
	if (!input_room_id) {
		return
	}
	goto(`/room/${input_room_id}`)
}
</script>

<div class="flex flex-col items-center space-y-4">
    <div class="flex space-x-2 items-center">
        <label for="">Your peer id is: {perma_state.global_settings.peer_id || 'No id assigned'}</label>
        <button
            class="bg-green-200 hover:bg-green-300 m-2 p-2 rounded"
            class:opacity-0={!perma_state.global_settings.peer_id}
            disabled={!perma_state.global_settings.peer_id}
            onclick={reset_peer_id}
        >Reset peer id</button>
    </div>
    <button class="bg-green-200 hover:bg-green-300 m-2 p-2 rounded" onclick={create_room}>Create room</button>
    <div class="flex space-x-4">
        <input class="border m-2 p-2 rounded" type="text" placeholder="Room ID to join" bind:value={input_room_id}>
        <button class="bg-green-200 hover:bg-green-300 m-2 p-2 rounded" onclick={join_room}>Join room</button>
    </div>    
</div>