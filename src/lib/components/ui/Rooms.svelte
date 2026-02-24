<script lang="ts">
import { redirect } from "@sveltejs/kit"
import { goto } from "$app/navigation"

let input_room_id = $state("")

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
    <button class="hover:bg-green-300 m-2 p-2 rounded" onclick={create_room}>Create room</button>
    <div class="flex space-x-4">
        <input class="border m-2 p-2 rounded" type="text" placeholder="Room ID to join" bind:value={input_room_id}>
        <button class="hover:bg-green-300 m-2 p-2 rounded" onclick={join_room}>Join room</button>
    </div>    
</div>