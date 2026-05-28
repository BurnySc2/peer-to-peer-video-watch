<script lang="ts">
import { LINEAR } from "./CustomSliderConstants"

interface Props {
    min?: number
    max?: number
    value: number
    on_change: (value: number) => void
    tooltip_function?: (value: number) => string
    step_fn?: (normalized: number) => number
}

function default_tooltip_formatting(value: number): string {
    return `${Math.round(value * 100)}%`
}

let {
    min = 0,
    max = 1,
    value = $bindable(),
    on_change,
    tooltip_function = default_tooltip_formatting,
    step_fn = LINEAR,
}: Props = $props()

let mouse_x = $state(0)
let mouse_pressed = $state(false)

const PADDING_PX = 8

// ----- Shared hover state -----
let hover_value = $state<number | null>(null)
let hover_percent = $state(0)

// ----- Unified calculation -----
function calc_percent(target: HTMLElement): number {
    const rect = target.getBoundingClientRect()
    // Accurate at the left of slider
    // const percent = Math.min(1, Math.max(0, (mouse_x - rect.left - 8) / rect.width))
    // Accurate at the right of slider
    // const percent = Math.min(1, Math.max(0, (mouse_x - rect.left + 8) / rect.width))

    const base_pct = (mouse_x - rect.left) / rect.width
    const pad_ratio = PADDING_PX / rect.width
    const percent = Math.max(0, Math.min(1, base_pct * (1 + 2 * pad_ratio) - pad_ratio))

    // Intepolation alternative
    // const c = (2 * PADDING_PX * (mouse_x - rect.left - rect.width / 2)) / rect.width
    // const percent = Math.min(1, Math.max(0, (mouse_x - rect.left + c) / rect.width))
    return percent
}

// Convert slider position (0-1) to actual value
function calc_actual(normalized: number): number {
    return min + step_fn(normalized) * (max - min)
}

// ----- Handler: update hover from mouse position -----
function update_hover(percent: number) {
    hover_percent = percent * 100
    hover_value = calc_actual(percent)
}

function handle_pointer_move(event: PointerEvent) {
    mouse_x = event.clientX
    if (event.buttons === 0) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#determining_button_states
        // Hotfix, sometimes mouse_up is not correctly detected
        mouse_pressed = false
    }
    const target = event.currentTarget as HTMLElement
    const percent = calc_percent(target)
    update_hover(percent)
    if (!mouse_pressed) {
        return
    }
    on_change(calc_actual(percent))
}

function handle_mouse_down(event: MouseEvent) {
    mouse_x = event.x
    mouse_pressed = true
    const percent = calc_percent(event.target as HTMLElement)
    update_hover(percent)
    on_change(calc_actual(percent))
}

function handle_mouse_up(_event: MouseEvent) {
    mouse_pressed = false
    // const target = event.currentTarget as HTMLElement
    // const percent = calc_percent(target)
    // on_change(calc_actual(percent))
}

// ----- Sync input value with external value -----
let slider_input_value = $derived(value - min)
</script>

<div
    class="relative px-[{PADDING_PX}px]"
    role="presentation"
>
    <input
        class="w-full"
        type="range"
        min="0"
        max={max - min}
        step="0.01"
        value={slider_input_value}
        onmousedown={handle_mouse_down}
        onmouseup={handle_mouse_up}
        onpointermove={handle_pointer_move}
        onpointerleave={() => { hover_value = null }}
    >
    {#if hover_value !== null}
        <!-- TODO Adjust style:left value to improve positioning -->
        <div
            class="absolute -top-6 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded pointer-events-none"
            style="left: {hover_percent}%"
        >
            {tooltip_function(hover_value)}
        </div>
    {/if}
</div>
