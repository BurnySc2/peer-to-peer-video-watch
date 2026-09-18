<script lang="ts">
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { parse_subtitle_offset } from "./subtitle_helpers"

interface MyProps {
    send_subtitle_offset?: (message: { subtitle_offset: number }) => void
}
let {
    send_subtitle_offset = (message: { subtitle_offset: number }) => {
        console.log("Sending subtitle_offset", message.subtitle_offset)
    },
}: MyProps = $props()

function set_subtitle_offset(value: string) {
    const value_as_number = parse_subtitle_offset(value)
    if (value_as_number === null) {
        return
    }
    temp_state.subtitles.offset = value_as_number
    send_subtitle_offset({ subtitle_offset: value_as_number })
}
</script>

<div class="flex flex-col border border-gray-600 rounded">
    <label
        class="text-center select-none"
        for="subtitle_offset"
        >Add subs delay</label
    >
    <input
        type="number"
        step="1"
        class="border-t border-gray-600 p-1 text-center"
        id="subtitle_offset"
        value={temp_state.subtitles.offset}
        onfocus={(e) => e.currentTarget.select()}
        oninput={(e) => {
            set_subtitle_offset((e.target as HTMLInputElement).value)
        }}
    >
</div>
<div class="flex flex-col border border-gray-600 rounded">
    <label
        class="text-center select-none"
        for="subtitle_font_size"
        >Subs size</label
    >
    <input
        type="number"
        class="border-t border-gray-600 p-1 text-center"
        id="subtitle_font_size"
        step="0.25"
        bind:value={perma_state.global_settings.subtitles_font_size_rem}
    >
</div>
