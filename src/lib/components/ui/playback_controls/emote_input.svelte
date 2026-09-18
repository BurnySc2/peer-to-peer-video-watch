<script lang="ts">
import { APP_CONFIG } from "$lib/config"
import { perma_state } from "$lib/persistent-storage.svelte"
import type { Emote } from "../emotes"
import { dedupe_emote_urls, normalize_emote_url, split_emote_input } from "./emote_helpers"

let flash = $state(false)
let emote_input = $state("")

function handle_emote_submit() {
    flash = true
    setTimeout(() => (flash = false), 300)
    if (perma_state.global_settings.personal_emotes.some((e) => e.url === emote_input)) {
        emote_input = ""
        return
    }

    const raw = emote_input
    emote_input = ""

    const split = split_emote_input(raw)
    const normalized: string[] = []
    const raw_by_href = new Map<string, string>()
    for (const part of split) {
        const href = normalize_emote_url(part, APP_CONFIG.allowed_emote_origins)
        if (href === null) {
            try {
                const parsed_url = new URL(part.trim())
                void parsed_url
                console.log(`Rejecting, invalid origin: ${part}`)
            } catch {
                console.log(`Invalid url ${part.trim()}`)
            }
            continue
        }
        normalized.push(href)
        if (!raw_by_href.has(href)) {
            raw_by_href.set(href, part)
        }
    }

    const existing = perma_state.global_settings.personal_emotes.map((e) => e.url)
    const seen_urls = new Set(existing)
    for (const href of normalized) {
        if (seen_urls.has(href)) {
            console.log(`Rejecting, duplicate: ${raw_by_href.get(href) ?? href}`)
            continue
        }
        seen_urls.add(href)
    }
    const fresh = dedupe_emote_urls(existing, normalized)
    for (const url of fresh) {
        const new_emote: Emote = { name: "", url }
        perma_state.global_settings.personal_emotes.push(new_emote)
    }
}
</script>

<div
    class="flex flex-col items-center border border-gray-600 rounded"
    title="Accepts multiple urls. Middle mouse click emote to delete."
>
    <label
        class="select-none"
        for="add_emote"
        >Add emote</label
    >
    <input
        type="text"
        id="add_emote"
        data-testid="add-emote"
        placeholder="Paste emote"
        class="border-t border-gray-600 max-w-full transition-colors duration-300 text-center p-1
           {flash ? 'bg-blue-200' : ''}"
        bind:value={emote_input}
        oninput={handle_emote_submit}
    >
</div>
