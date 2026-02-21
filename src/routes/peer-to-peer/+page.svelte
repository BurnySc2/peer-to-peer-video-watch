<script lang="ts">
import type { DataConnection } from "peerjs"
import { Peer } from "peerjs"
import { onMount } from "svelte"

type Message = {
	from: string
	text: string
}

// Input elements
let input_connect_id = $state("")
let input_message = $state("")

// State data
let my_id = $state("")
let connections: DataConnection[] = $state([])
// Chat log
let messages: Message[] = $state([])
let other_messages = $derived(messages.filter((m) => m.from !== "me"))

let peer = new Peer()

function setup_connection(conn: DataConnection) {
	conn.on("open", () => {
		console.log("Setting up open")
		conn.send({ text: "hello", from: my_id })
	})

	// @ts-expect-error
	conn.on("data", (data: Message) => {
		// Handle incoming messages (string, object, whatever you send)
		console.log(`Receiving data: ${JSON.stringify(data, undefined, 4)}`)
		console.log(data.text)

		messages = [...messages, { from: conn.peer || "someone", text: data.text }]
	})

	conn.on("close", () => {
		// Clean up when peer disconnects
		connections = connections.filter((c) => c !== conn)
	})

	conn.on("error", (err) => {
		console.error("Connection error:", err)
	})

	// Add to our list of active connections
	connections = [...connections, conn]
}

onMount(() => {
	peer = new Peer() // or new Peer({ host: '...', port: ..., path: '/myapp' }) if custom server

	peer.on("open", (id) => {
		my_id = id
		console.log("My id:")
		console.log(my_id)
	})

	// When someone connects TO us
	peer.on("connection", (conn) => {
		setup_connection(conn)
	})
})

function connect(remote_id: string) {
	if (!remote_id || remote_id === my_id) return

	console.log(`Connecting to ${remote_id}`)

	const conn = peer.connect(remote_id)

	setup_connection(conn) // same setup as incoming
}
function broadcast_message() {
	if (!input_message.trim()) return

	const message_to_send = input_message.trim() // or { text: message, from: myId, time: Date.now() }

	// Send to every active connection
	connections.forEach((conn) => {
		if (conn.open) {
			// only if still open
			conn.send({
				from: my_id,
				text: message_to_send,
			})
		}
	})

	// Show our own message in chat too
	messages = [...messages, { from: "me", text: message_to_send }]

	input_message = "" // clear input
}
</script>

<div class="flex flex-col items-center">
	{#if my_id !== ""}
		<div>My id:</div>
		<div>{my_id}</div>
	{/if}

	<div class="h-10"></div>

	<div>Connections: {connections.map(c => c.peer).join(", ")}</div>

	<div class="h-10"></div>

	<input class="border m-2 w-48" type="text" bind:value={input_connect_id}>
	<button class="border hover:bg-green-300 bg-green-400 m-2 p-2" onclick={() => {connect(input_connect_id)}}>Connect to peer id</button>
    
	<div class="h-10"></div>

	<input class="border m-2 w-48" type="text" bind:value={input_message}>
	<button class="border hover:bg-green-300 bg-green-400 m-2 p-2" onclick={() => { broadcast_message()}}>Send message</button>
    
	{#if 0 < other_messages.length}
		<div>Last received message:</div>
		<div>{other_messages.at(-1)?.text}</div>		
	{/if}
</div>