<script lang="ts">
import Navigation from "$lib/components/Navigation.svelte"
import CustomSlider from "$lib/components/ui/CustomSlider.svelte"
import { LINEAR, LOGARITHMIC, SQUARED } from "$lib/components/ui/CustomSliderConstants"
import { format_time } from "$lib/utils/format_time"

let linear_value = $state(0.75)
let squared_value = $state(0.5)
let logarithmic_value = $state(0.5)
let volume_value = $state(0.5)
let time_seconds_value = $state(3667)
</script>

<Navigation />

<div class="flex flex-col items-center p-8">
    <h1 class="text-2xl font-bold mb-6">Slider Test</h1>
    <div class="flex items-center justify-center w-full">
        <div class="flex flex-col w-full p-20 gap-8">
            <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                    <span class="font-medium">Linear</span>
                    <span>{Math.round(linear_value * 100)}%</span>
                </div>
                <CustomSlider
                    min={0.5}
                    max={1.5}
                    bind:value={linear_value}
                    on_change={(v) => (linear_value = v)}
                    step_fn={LINEAR}
                />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                    <span class="font-medium">Squared</span>
                    <span>{Math.round(squared_value * 100)}%</span>
                </div>
                <CustomSlider
                    min={0}
                    max={4}
                    bind:value={squared_value}
                    on_change={(v) => (squared_value = v)}
                    step_fn={SQUARED}
                />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                    <span class="font-medium">Logarithmic</span>
                    <span>{Math.round(logarithmic_value * 100)}%</span>
                </div>
                <CustomSlider
                    min={0}
                    max={10}
                    bind:value={logarithmic_value}
                    on_change={(v) => (logarithmic_value = v)}
                    step_fn={LOGARITHMIC}
                />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                    <span class="font-medium">Volume-like</span>
                    <span>{Math.round(volume_value * 100)}%</span>
                </div>
                <CustomSlider
                    min={0}
                    max={1}
                    bind:value={volume_value}
                    on_change={(v) => (volume_value = v)}
                    step_fn={SQUARED}
                />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                    <span class="font-medium">Time-like</span>
                    <span>{format_time(time_seconds_value)}</span>
                </div>
                <CustomSlider
                    min={0}
                    max={7200}
                    bind:value={time_seconds_value}
                    tooltip_function={format_time}
                    on_change={(v) => (time_seconds_value = v)}
                />
            </div>
        </div>
    </div>
</div>
