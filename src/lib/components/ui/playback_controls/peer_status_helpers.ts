// Pure peer status helpers extracted from PeerStatusRow.svelte.
// No Svelte runes, no state imports, no DOM.

// Whole seconds since last_seen, with the same +1 bias as the template.
export function peer_age_seconds(now: number, last_seen: number): number {
    return 1 + Math.floor((now - last_seen) / 1000)
}

// Color thresholds matching the PeerStatusRow template.
export function peer_status_for(age_s: number): "green" | "orange" | "red" {
    if (age_s < 6) {
        return "green"
    }
    if (age_s < 11) {
        return "orange"
    }
    return "red"
}
