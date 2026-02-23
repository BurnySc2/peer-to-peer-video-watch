<script lang="ts">
// TODO Implement video player with control buttons

// normal: show meta info below player, enable scroll
// theater:
// fullscreen: only show video unless hovering with mouse in video player, then temporarily (debounce) show controls
let mode = $state<"normal" | "theater" | "fullscreen">("normal")
let volume = $state(0.5)
let playback_position = $state(0)
let playback_speed = $state(1.0)

// Playlist would be outside of this element
let segments = $state([])

function pause_unpause() {
	// Resumes playback or pauses
}
function seek(new_playback_position: number) {
	// Seeks to target time in video
}
function set_volume(new_volume: number) {
	// Set volume to target
	// 0 to 1
}
function set_playback_speed(new_playback_speed: number) {}
function toggle_fullscreen() {}
</script>


<div>
    <!-- TODO Implement video player -->
</div>


