<script lang="ts">
import { resolve } from "$app/paths"
import { page } from "$app/state"

const is_active = (path: string) => {
    return page.url.pathname === path
}
</script>

<nav class="bg-gray-800 p-4 text-white">
    <div class="container mx-auto flex justify-center space-x-8">
        <a
            href={resolve('/')}
            class="transition-colors hover:text-gray-300 {is_active('/') ? 'font-bold' : ''}"
            >Home</a
        >
        <a
            href={resolve('/peer-to-peer')}
            class="transition-colors hover:text-gray-300 {is_active('/peer-to-peer') ? 'font-bold' : ''}"
            >Peer-to-peer</a
        >
        <a
            href={resolve('/video-player')}
            class="transition-colors hover:text-gray-300 {is_active('/video-player') ? 'font-bold' : ''}"
            >Video player</a
        >
        <a
            href={resolve('/rooms')}
            class="transition-colors hover:text-gray-300 {is_active('/rooms') ? 'font-bold' : ''}"
            >Rooms</a
        >
    </div>
</nav>
