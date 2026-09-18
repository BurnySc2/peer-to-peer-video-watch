// Pure sleep timer helpers extracted from PlaybackControls.svelte set_sleep_timer.
// The interval ticking itself stays in the component, only math lives here.
// No Svelte runes, no state imports, no DOM.

// Normalize requested minutes, non-positive input clears the timer.
export function next_sleep_remaining(current: number): number {
    if (current <= 0) {
        return 0
    }
    return current
}

// True once the countdown reached zero and playback should pause.
export function should_trigger_sleep(remaining: number): boolean {
    return remaining <= 0
}
