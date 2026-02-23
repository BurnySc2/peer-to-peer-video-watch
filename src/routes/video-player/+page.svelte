<script lang="ts">
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

// Replace with p2p send
function send(msg) {
	console.log("Send: ", msg)
}

function onPlay(): void {
	if (isRemoteAction) return

	send({
		type: "play",
		time: video_element.currentTime,
	})
	// Resumes playback or pauses
}

function onPause(): void {
	if (isRemoteAction) return

	send({
		type: "pause",
		time: video_element.currentTime,
	})
}

function onSeeked(): void {
	if (isRemoteAction) return

	send({
		type: "seeked",
		time: video_element.currentTime,
	})
}

function onRateChange() {
	if (isRemoteAction) return

	send({
		type: "rate",
		value: video_element.playbackRate,
		time: video_element.currentTime,
	})
}

// Buffering
function onWaiting(): void {
	send({
		type: "waiting",
		time: video_element.currentTime,
	})
}

// Buffer resume
function onPlaying(): void {
	send({
		type: "resume",
		time: video_element.currentTime,
	})
}

// Network issues
function onStalled(): void {
	send({
		type: "stalled",
		time: video_element.currentTime,
	})
}

// play/pause/speed should be changed to `if (msg.type == "play")` etc
function play() {
	isRemoteAction = true
	video_element.play()
	isRemoteAction = false
}

function pause() {
	isRemoteAction = true
	video_element.pause()
	isRemoteAction = false
}

function set_playback_speed(msg) {
	isRemoteAction = true
	video_element.currentTime = msg.time
	video_element.playbackRate = msg.value
	playback_speed = msg.value // keep UI in sync
	isRemoteAction = false
}

function seek(new_playback_position: number) {
	// Seeks to target time in video
	isRemoteAction = true
	video_element.currentTime = new_playback_position
	video_element.play()
	isRemoteAction = false
}

function set_volume(new_volume: number) {
	// Set volume to target
	// 0 to 1
}

function toggle_fullscreen() {}
</script>

<div class="flex flex-col items-center w-screen">
	<input class="m-2 p-2 border" bind:value={video_url} placeholder="Enter video url" />
    <!-- TODO Implement video player -->
	<video bind:this={video_element}
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
			<select id="playback_speed" bind:value={playback_speed}>
				{#each playback_speeds as ps}
					<option value={ps}>{ps}</option>
				{/each}
			</select>
		</div>		
	{/if}
</div>


