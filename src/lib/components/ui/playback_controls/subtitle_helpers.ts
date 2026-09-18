// Pure subtitle helpers extracted from PlaybackControls.svelte set_subtitle_offset.
// No Svelte runes, no state imports, no DOM.

// Parse raw input, NaN becomes null so callers can ignore invalid input.
export function parse_subtitle_offset(raw: string): number | null {
    const value_as_number = Number(raw)
    if (Number.isNaN(value_as_number)) {
        return null
    }
    return value_as_number
}
