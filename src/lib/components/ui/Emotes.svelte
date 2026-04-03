<script lang="ts">
import { APP_CONFIG } from "$lib/config"
import SmileyIcon from "$lib/icons/SmileyIcon.svelte"
import StarIcon from "$lib/icons/StarIcon.svelte"
import { p2p_send_emote } from "$lib/peer_handling/peer_send.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import type { Emote } from "./emotes"
import { global_emotes } from "./emotes"

interface Props {
    controls_opacity: number
    onMouseEnterControls?: () => void
    onMouseLeaveControls?: () => void
}

let {
    controls_opacity = $bindable(),
    onMouseEnterControls = () => {},
    onMouseLeaveControls = () => {},
}: Props = $props()

let show_emote_list = $state(false)
let allow_emote_push = true
function display_emote(emote: string) {
    console.log(emote)
    if (!allow_emote_push) {
        return
    }
    allow_emote_push = false
    show_emote_list = false
    const id = generate_emote_id()

    temp_state.emote_state.push({ id, src: emote })
    p2p_send_emote(id, emote)
    setTimeout(() => {
        const index = temp_state.emote_state.findIndex((i) => i.id === id)
        if (index !== -1) {
            temp_state.emote_state.splice(index, 1)
        }
    }, APP_CONFIG.emote_expire_ms)
    setTimeout(() => {
        allow_emote_push = true
    }, APP_CONFIG.emote_send_cooldown_ms)
}

function generate_emote_id(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function random_helper(a: number, b: number): number {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return Math.random() * (max - min) + min
}

function delete_local_emote(emote: Emote) {
    perma_state.global_settings.personal_emotes = perma_state.global_settings.personal_emotes.filter(
        (item) => item.url !== emote.url,
    )

    perma_state.global_settings.favourite_emotes = perma_state.global_settings.favourite_emotes.filter(
        (item) => item.url !== emote.url,
    )
}

function handle_toggle_favourite_emote(emote: Emote) {
    const favourite_emotes = perma_state.global_settings.favourite_emotes
    const exists = favourite_emotes.some((e) => e.url === emote.url)

    perma_state.global_settings.favourite_emotes = exists
        ? favourite_emotes.filter((e) => e.url !== emote.url)
        : [...favourite_emotes, emote]
}

function is_favourite_emote(emote: Emote) {
    return perma_state.global_settings.favourite_emotes.some((e) => e.url === emote.url)
}

$effect(() => {
    if (controls_opacity === 0) {
        show_emote_list = false
    }
})
</script>

{#each temp_state.emote_state as emote (emote.id)}
    {@const rise_time_s = random_helper(10,14)}
    {@const wobble = random_helper(1.5,2.5)}
    {@const x = random_helper(-80,0)}
    <div
        class="absolute bottom-0 right-0 w-24 h-24 flex items-center justify-center"
        style="transform: translateX({x}px);"
        data-testid="pushed-emote"
    >
        <img
            src={emote.src}
            class="max-w-3/4 max-h-3/4 object-contain drop-shadow pointer-events-none emote-rise"
            style="--rise-time:{rise_time_s}s; --wobble-time:{wobble}s;"
            alt=""
        >
    </div>
{/each}
<div
    role="toolbar"
    aria-label="Emoji controls"
    tabindex="0"
    onpointerenter={onMouseEnterControls}
    onpointerleave={onMouseLeaveControls}
>
    {#if show_emote_list}
        <div class="absolute bottom-10 right-0 bg-gray-900/75 rounded-t-lg p-1 max-h-48 overflow-y-auto emote-scroll">
            {#if perma_state.global_settings.favourite_emotes.length}
                <div class="flex items-center gap-2 my-2 text-xs text-gray-300 uppercase">
                    <div class="grow h-px bg-gray-600"></div>
                    <span>Favourites</span>
                    <div class="grow h-px bg-gray-600"></div>
                </div>
                <div class="grid grid-cols-5 gap-2 justify-items-center">
                    {#each perma_state.global_settings.favourite_emotes as emote}
                        <div class="relative w-8 h-8 flex items-center justify-center cursor-pointer hover:outline">
                            <button
                                onclick={() => {display_emote(emote.url)}}
                                class="w-full h-full"
                            >
                                <img
                                    class="w-full h-full object-cover"
                                    src={emote.url}
                                    alt=""
                                    title={emote.name}
                                    loading="lazy"
                                >
                            </button>
                            <button
                                class="absolute top-0 right-0 h-3 w-3 text-yellow-300"
                                onclick={() => {handle_toggle_favourite_emote(emote)}}
                                title="Add/remove from favourites"
                            >
                                <StarIcon filled={is_favourite_emote(emote)} />
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if perma_state.global_settings.personal_emotes.length}
                <div class="flex items-center gap-2 my-2 text-xs text-gray-300 uppercase">
                    <div class="grow h-px bg-gray-600"></div>
                    <span>Yours</span>
                    <div class="grow h-px bg-gray-600"></div>
                </div>
                <div
                    class="grid grid-cols-5 gap-2 justify-items-center"
                    data-testid="personal-emotes"
                >
                    {#each perma_state.global_settings.personal_emotes as emote}
                        <div class="relative w-8 h-8 flex items-center justify-center cursor-pointer hover:outline">
                            <button
                                onclick={() => {display_emote(emote.url)}}
                                onauxclick={() => delete_local_emote(emote)}
                                class="w-full h-full"
                            >
                                <img
                                    class="w-full h-full object-cover"
                                    src={emote.url}
                                    alt=""
                                    loading="lazy"
                                >
                            </button>
                            <button
                                class="absolute top-0 right-0 h-3 w-3 text-yellow-300"
                                onclick={() => {handle_toggle_favourite_emote(emote)}}
                                title="Add/remove from favourites"
                            >
                                <StarIcon filled={is_favourite_emote(emote)} />
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
            <div class="flex items-center gap-2 my-2 text-xs text-gray-300 uppercase">
                <div class="grow h-px bg-gray-600"></div>
                <span>Global</span>
                <div class="grow h-px bg-gray-600"></div>
            </div>
            <div
                class="grid grid-cols-5 gap-2 justify-items-center"
                data-testid="global-emotes"
            >
                {#each global_emotes as emote}
                    <div class="relative w-8 h-8 flex items-center justify-center cursor-pointer hover:outline">
                        <button
                            onclick={() => {display_emote(emote.url)}}
                            class="w-full h-full"
                        >
                            <img
                                class="w-full h-full object-cover"
                                src={emote.url}
                                alt=""
                                title={emote.name}
                                loading="lazy"
                            >
                        </button>
                        <button
                            class="absolute top-0 right-0 h-3 w-3 text-yellow-300"
                            onclick={() => {handle_toggle_favourite_emote(emote)}}
                            title="Add/remove from favourites"
                        >
                            <StarIcon filled={is_favourite_emote(emote)} />
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <button
            class="absolute right-1 bottom-6 -translate-y-1/2 mr-1 p-1 bg-black/60 rounded-xl hover:text-blue-400 hover:scale-130 transition-opacity duration-500"
            style="opacity: {controls_opacity};"
            data-testid="open-emote-menu"
            onclick={() => {show_emote_list = !show_emote_list}}
        >
            <SmileyIcon />
        </button>
    {/if}
</div>

<style>
@keyframes emote-rise {
    from {
        offset-distance: 0%;
        opacity: 1;
    }
    to {
        offset-distance: 100%;
        opacity: 0;
    }
}

@keyframes emote-wobble {
    0% {
        transform: rotate(-8deg);
    }
    50% {
        transform: rotate(8deg);
    }
    100% {
        transform: rotate(-8deg);
    }
}

.emote-rise {
    offset-path: path("M0,0 C 40,-120 -40,-240 20,-360 C -20,-480 20,-600 0,-720");
    offset-rotate: 0deg;
    animation:
        emote-rise var(--rise-time, 6s) linear forwards,
        emote-wobble var(--wobble-time, 2s) ease-in-out infinite;
}
</style>
