<script lang="ts">
import "../app.css"
import favicon from "$lib/assets/favicon.svg"
import Footer from "$lib/components/Footer.svelte"

let { children } = $props()
</script>

<svelte:head>
    <link
        rel="icon"
        href={favicon}
    >
</svelte:head>

<div class="flex min-h-screen flex-col bg-gray-900 text-white">
    <main class="flex-1">{@render children?.()}</main>
    <Footer />
</div>
