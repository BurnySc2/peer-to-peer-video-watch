<script lang="ts">
// TODO: Send video segment data
import type { DataConnection } from "peerjs"
import { Peer } from "peerjs"
import { onMount } from "svelte"

type Message = {
    from: string
    text: string
}

type VidMessage = {
    from: "peer-id"
    type: "play" | "pause" | "seek" | "rate" | "sync"
    time: number
    value?: number
    playing?: boolean
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
        handle_vid_event(data)
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

// Video stuff

function broadcast_vid_message(msg: VidMessage) {
    if (!msg?.type) return

    const payload = {
        ...msg,
        from: my_id,
    }
    // Send to every active connection
    connections.forEach((conn) => {
        if (conn.open) conn.send(payload)
    })
}

function handle_vid_event(data) {
    console.log(data)
    console.log(data.type)
    if (!data?.type) return

    if (data.from === my_id) return

    switch (data.type) {
        case "play":
            isRemoteAction = true
            video_element.play()
            isRemoteAction = false
            break

        case "pause":
            isRemoteAction = true
            video_element.pause()
            isRemoteAction = false
            break

        case "rate":
            // Change playback speed
            isRemoteAction = true
            video_element.currentTime = data.time
            video_element.playbackRate = data.value
            playback_speed = data.value // keep UI in sync
            isRemoteAction = false
            break

        case "seeked":
            // Seeks to target time in video
            isRemoteAction = true
            video_element.currentTime = data.time
            video_element.play()
            isRemoteAction = false
            break
    }
}

// TODO Implement video player with control buttons
const playback_speeds = [0.75, 1.0, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5, 1.75, 2.0, 3.0, 4.0, 10.0]

let video_element = $state<HTMLVideoElement>()
let video_url = $state("")

// normal: show meta info below player, enable scroll
// theater:
// fullscreen: only show video unless hovering with mouse in video player, then temporarily (debounce) show controls
let mode = $state<"normal" | "theater" | "fullscreen">("normal")
let volume = $state(0.5)
let playback_position = $state(0)
let playback_speed = $state(1.0)

// Playlist would be outside of this element
let segments = $state([])

// Guard against feedback loop, since remote command will fire events locally too...
let isRemoteAction = false

function onPlay(): void {
    if (isRemoteAction) return

    broadcast_vid_message({
        type: "play",
        time: video_element.currentTime,
    })
}

function onPause(): void {
    if (isRemoteAction) return

    broadcast_vid_message({
        type: "pause",
        time: video_element.currentTime,
    })
}

function onSeeked(): void {
    if (isRemoteAction) return

    broadcast_vid_message({
        type: "seeked",
        time: video_element.currentTime,
    })
}

function onRateChange() {
    if (isRemoteAction) return

    broadcast_vid_message({
        type: "rate",
        value: video_element.playbackRate,
        time: video_element.currentTime,
    })
}

// Buffering
function onWaiting(): void {
    // send({
    //   type: "waiting",
    //   time: video_element.currentTime
    // });
}

// Buffer resume
function onPlaying(): void {
    // send({
    //   type: "resume",
    //   time: video_element.currentTime
    // });
}

// Network issues
function onStalled(): void {
    // send({
    //   type: "stalled",
    //   time: video_element.currentTime
    // });
}

function set_volume(new_volume: number) {
    // Set volume to target
    // 0 to 1
}

function toggle_fullscreen() {}
</script>

<div class="flex flex-col items-center">
    {#if my_id !== ""}
        <div>My id:</div>
        <div>{my_id}</div>
    {/if}

    <div class="h-10"></div>

    <div>Connections: {connections.map(c => c.peer).join(", ")}</div>

    <div class="h-10"></div>

    <input
        class="border m-2 w-48"
        type="text"
        bind:value={input_connect_id}
    >
    <button
        class="border hover:bg-green-300 bg-green-400 m-2 p-2"
        onclick={() => {connect(input_connect_id)}}
    >
        Connect to peer id
    </button>

    <div class="h-10"></div>

    <input
        class="border m-2 w-48"
        type="text"
        bind:value={input_message}
    >
    <button
        class="border hover:bg-green-300 bg-green-400 m-2 p-2"
        onclick={() => { broadcast_message()}}
    >
        Send message
    </button>

    {#if 0 < other_messages.length}
        <div>Last received message:</div>
        <div>{other_messages.at(-1)?.text}</div>
    {/if}
    <input
        class="m-2 p-2 border"
        bind:value={video_url}
        placeholder="Enter video url"
    >
    <!-- TODO Implement video player -->
    <video
        bind:this={video_element}
        controls
        muted
        playsinline
        bind:playbackRate={playback_speed}
        onplay={onPlay}
        onpause={onPause}
        onseeked={onSeeked}
        onwaiting={onWaiting}
        onplaying={onPlaying}
        onstalled={onStalled}
        onratechange={onRateChange}
        src={video_url}
        class="max-h-[75vh]"
    >
        Your browser does not support the video tag.
    </video>
    {#if video_element}
        <div class="flex">
            <label for="playback_speed">Playback rate</label>
            <select
                id="playback_speed"
                bind:value={playback_speed}
            >
                {#each playback_speeds as ps}
                    <option value={ps}>{ps}</option>
                {/each}
            </select>
        </div>
    {/if}
</div>
