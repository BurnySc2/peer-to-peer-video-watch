<script lang="ts">
interface Props {
    subtitle_text: string
    enabled: boolean
}

let { subtitle_text, enabled }: Props = $props()
</script>

<div
    class="absolute bottom-10 left-0 w-full text-center text-lg pointer-events-none transition-opacity duration-150"
    style="opacity: {subtitle_text && enabled ? 1 : 0}"
>
    <div class="inline-block p-2 bg-black/70 rounded-lg">{subtitle_text}</div>
</div>
