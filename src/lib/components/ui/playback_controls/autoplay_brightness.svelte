<script lang="ts">
import CustomSlider from "$lib/components/ui/CustomSlider.svelte"
import { LINEAR } from "$lib/components/ui/CustomSliderConstants"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
</script>

<div class="col-start-1 flex flex-col items-center space-y-1 border border-gray-600 rounded p-2">
    <label
        class="select-none"
        for="autoplay"
        >Autoplay</label
    >
    <input
        type="checkbox"
        id="autoplay"
        class=""
        bind:checked={temp_state.autoplay}
    >
</div>
<div class="flex flex-col col-span-2 border border-gray-600 rounded p-1 w-full">
    <div class="flex justify-between items-center">
        <label
            class="flex-1 text-center select-none"
            for="brightness_control"
            >Brightness</label
        >
        <button
            class="border border-gray-600 rounded hover:bg-blue-400 px-2 py-1 text-xs select-none"
            onclick={() => {perma_state.global_settings.brightness = 1}}
        >
            Reset
        </button>
    </div>
    <div
        class="relative px-2"
        role="presentation"
    >
        <CustomSlider
            min={0}
            max={5}
            bind:value={perma_state.global_settings.brightness}
            on_change={(value: number) => {perma_state.global_settings.brightness = value}}
            step_fn={LINEAR}
        />
    </div>
</div>
