// Pure emote helpers extracted from PlaybackControls.svelte handle_emote_submit.
// No Svelte runes, no state imports, no DOM. Explicit args in, values out.

// Split raw input on comma first, then space, else single entry.
// Matches the branching in handle_emote_submit.
export function split_emote_input(raw: string): string[] {
    if (raw.includes(",")) {
        return raw.split(",")
    }
    if (raw.includes(" ")) {
        return raw.split(" ")
    }
    return [raw]
}

// Validate one emote candidate and return the stored href, or null when rejected.
// Checks allowed origins and rewrites 7tv.app page urls to cdn.7tv.app urls.
export function normalize_emote_url(raw: string, allowed: readonly string[]): string | null {
    try {
        const emote_url = new URL(raw.trim())
        if (!allowed.includes(emote_url.origin)) {
            return null
        }
        // Convert 7tv page url to cdn url.
        if (emote_url.origin === "https://7tv.app") {
            const emote_id = emote_url.pathname.split("/").at(-1)
            return `https://cdn.7tv.app/emote/${emote_id}/4x.avif`
        }
        return emote_url.href
    } catch {
        return null
    }
}

// Drop candidates already stored, also drop repeats within candidates.
// Both lists hold final hrefs (after normalize_emote_url).
export function dedupe_emote_urls(existing: string[], candidates: string[]): string[] {
    const seen = new Set(existing)
    const fresh: string[] = []
    for (const candidate of candidates) {
        if (seen.has(candidate)) {
            continue
        }
        seen.add(candidate)
        fresh.push(candidate)
    }
    return fresh
}
