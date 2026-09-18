<script lang="ts">
import CustomSlider from "$lib/components/ui/CustomSlider.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"

function toggle_mute() {
    temp_state.is_muted = !temp_state.is_muted
}
</script>

<div class="flex flex-col col-span-2 border border-gray-600 rounded p-1 w-full">
    <div class="relative w-full flex items-center">
        <label
            class="absolute left-1/2 -translate-x-1/2 text-center select-none"
            for="volume_control"
            >Volume</label
        >
        {#if temp_state.is_muted}
            <button
                class="ml-auto border border-gray-600 rounded hover:bg-blue-400 px-2 py-1 text-xs select-none"
                onclick={toggle_mute}
            >
                Unmute
            </button>
        {:else}
            <button
                class="ml-auto border border-gray-600 rounded hover:bg-blue-400 px-2 py-1 text-xs select-none"
                onclick={toggle_mute}
            >
                Mute
            </button>
        {/if}
    </div>
    <div
        class="relative px-2"
        role="presentation"
    >
        <CustomSlider
            min={0}
            max={1}
            value={temp_state.is_muted ? 0 : perma_state.global_settings.volume}
            on_change={(value: number) => {
                perma_state.global_settings.volume = value
                temp_state.is_muted = false
            }}
        />
    </div>
</div>
