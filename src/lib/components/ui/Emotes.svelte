<script lang="ts">
import SmileyIcon from "$lib/icons/SmileyIcon.svelte"
import { p2p_send_emote } from "$lib/peer_handling/peer_send.svelte"
import { emote_state, emotes } from "$lib/utils/emotes.svelte"

const SEND_EMOTE_COOLDOWN_MS = 2000

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
    if (!allow_emote_push) return
    allow_emote_push = false
    show_emote_list = false
    const id = generate_emote_id()

    emote_state.push({ id, src: emote })
    p2p_send_emote(id, emote)
    setTimeout(() => {
        const index = emote_state.findIndex((i) => i.id === id)
        if (index !== -1) emote_state.splice(index, 1)
    }, 6000)
    setTimeout(() => {
        allow_emote_push = true
    }, SEND_EMOTE_COOLDOWN_MS)
}

function generate_emote_id() {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

$effect(() => {
    if (controls_opacity === 0) show_emote_list = false
})
</script>

{#each emote_state as emote (emote.id)}
    <img
        src={emote.src}
        class="absolute bottom-0 right-0 w-20 pointer-events-none emote-rise"
        alt=""
    >
{/each}
<div
    onpointerenter={onMouseEnterControls}
    onpointerleave={onMouseLeaveControls}
>
    {#if show_emote_list}
        <div class="absolute bottom-10 right-0 max-h-24 overflow-y-auto grid grid-cols-3 gap-2 justify-items-center">
            {#each emotes as emote}
                <button onclick={() => {display_emote(emote)}}>
                    <img
                        class="w-12"
                        src={emote}
                        alt=""
                        title={emote.split("/").pop()}
                    >
                </button>
            {/each}
        </div>
    {:else}
        <button
            class="absolute top-1/2 right-0 bg-black/60 text-white hover:text-blue-400 hover:scale-130 transition-opacity duration-500"
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
    animation:
        emote-rise 6s linear forwards,
        emote-wobble 2s ease-in-out infinite;
    offset-rotate: 0deg;
}
</style>
