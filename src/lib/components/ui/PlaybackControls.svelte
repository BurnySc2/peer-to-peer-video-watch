<script lang="ts">
import AutoplayBrightness from "$lib/components/ui/playback_controls/autoplay_brightness.svelte"
import EmoteInput from "$lib/components/ui/playback_controls/emote_input.svelte"
import PeerStatusPanel from "$lib/components/ui/playback_controls/peer_status_panel.svelte"
import PlaybackRate from "$lib/components/ui/playback_controls/playback_rate.svelte"
import PlaylistPanel from "$lib/components/ui/playback_controls/playlist_panel.svelte"
import SleepTimerInput from "$lib/components/ui/playback_controls/sleep_timer_input.svelte"
import SubtitleSettings from "$lib/components/ui/playback_controls/subtitle_settings.svelte"
import VolumeControl from "$lib/components/ui/playback_controls/volume_control.svelte"
import { type TPlayListItem, temp_state } from "$lib/temporary-storage.svelte"

interface MyProps {
    send_playlist_set?: (message: { playlist: TPlayListItem[]; playlist_index: number }) => void
    send_video_set_playback_rate?: (message: { time: number; value: number }) => void
    send_subtitle_offset?: (message: { subtitle_offset: number }) => void
}
let {
    send_playlist_set = (message: { playlist: TPlayListItem[]; playlist_index: number }) => {
        console.log("Sending playlist_set", message)
    },
    send_video_set_playback_rate = (message: { time: number; value: number }) => {
        console.log("Sending video_set_playback_rate", message.value)
    },
    send_subtitle_offset = (message: { subtitle_offset: number }) => {
        console.log("Sending subtitle_offset", message.subtitle_offset)
    },
}: MyProps = $props()
</script>

<div class="grid grid-cols-5 gap-4 max-w-1/2 pb-2">
    {#if temp_state.playlist.length}
        <PlaybackRate {send_video_set_playback_rate} />
        <VolumeControl />
        <SubtitleSettings {send_subtitle_offset} />
        <AutoplayBrightness />
        <EmoteInput />
        <SleepTimerInput />
    {/if}
    <PlaylistPanel {send_playlist_set} />
    <PeerStatusPanel />
</div>
