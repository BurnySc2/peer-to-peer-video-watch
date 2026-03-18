<script lang="ts">
import SmileyIcon from "$lib/icons/SmileyIcon.svelte"
import { p2p_send_emote } from "$lib/peer_handling/peer_send.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"
import { emote_state, emotes } from "$lib/utils/emotes.svelte"

const SEND_EMOTE_COOLDOWN_MS = 1000

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

    emote_state.push({ id, src: emote })
    p2p_send_emote(id, emote)
    setTimeout(() => {
        const index = emote_state.findIndex((i) => i.id === id)
        if (index !== -1) {
            emote_state.splice(index, 1)
        }
    }, 6000)
    setTimeout(() => {
        allow_emote_push = true
    }, SEND_EMOTE_COOLDOWN_MS)
}

function generate_emote_id(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function random_helper(a: number, b: number): number {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return Math.random() * (max - min) + min
}

function delete_local_emote(emote: string) {
    perma_state.global_settings.personal_emotes = perma_state.global_settings.personal_emotes.filter(
        (item) => item !== emote,
    )
}

$effect(() => {
    if (controls_opacity === 0) {
        show_emote_list = false
    }
})
</script>

{#each emote_state as emote (emote.id)}
    {@const rise = random_helper(5,7)}
    {@const wobble = random_helper(1.5,2.5)}
    {@const x = random_helper(-80,0)}
    <div
        class="absolute bottom-0 right-0 w-24 h-24 flex items-center justify-center"
        style="transform: translateX({x}px);"
    >
        <img
            src={emote.src}
            class="max-w-3/4 max-h-3/4 object-contain drop-shadow pointer-events-none emote-rise"
            style="--rise-time:{rise}s; --wobble-time:{wobble}s;"
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
        <div class="absolute bottom-10 right-0 bg-gray-900/75 rounded-t-lg p-1 max-h-48 overflow-y-auto ">
            <div class="flex items-center gap-2 my-2 text-xs text-gray-300 uppercase">
                <div class="grow h-px bg-gray-600"></div>
                <span>Your emotes</span>
                <div class="grow h-px bg-gray-600"></div>
            </div>
            <div class="grid grid-cols-5 gap-2 justify-items-center">
                {#each perma_state.global_settings.personal_emotes as emote}
                    <button
                        onclick={() => {display_emote(emote)}}
                        onauxclick={() => {delete_local_emote(emote)}}
                    >
                        <div class="w-8 h-8 flex items-center justify-center cursor-pointer hover:outline">
                            <img
                                class="max-w-full max-h-full object-contain"
                                src={emote}
                                alt=""
                                loading="lazy"
                            >
                        </div>
                    </button>
                {/each}
            </div>
            <div class="flex items-center gap-2 my-2 text-xs text-gray-300 uppercase">
                <div class="grow h-px bg-gray-600"></div>
                <span>Global emotes</span>
                <div class="grow h-px bg-gray-600"></div>
            </div>
            <div class="grid grid-cols-5 gap-2 justify-items-center">
                {#each emotes as emote}
                    <button onclick={() => {display_emote(emote)}}>
                        <div class="w-8 h-8 flex items-center justify-center cursor-pointer hover:outline">
                            <img
                                class="max-w-full max-h-full object-contain"
                                src={emote}
                                alt=""
                                title={emote.split("/").pop()}
                                loading="lazy"
                            >
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    {:else}
        <button
            class="absolute right-1 top-11/12 -translate-y-1/2 mr-1 p-1 bg-black/60 rounded-xl hover:text-blue-400 hover:scale-130 transition-opacity duration-500"
            style="opacity: {controls_opacity};"
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
