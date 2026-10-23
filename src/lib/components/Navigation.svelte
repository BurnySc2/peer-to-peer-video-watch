<script lang="ts">
import { resolve } from "$app/paths"
import { page } from "$app/state"

const is_active = (path: string) => {
    return page.url.pathname === path
}
</script>

<nav class="bg-gray-800 p-4 shadow-2xl rounded">
    <div class="container mx-auto flex justify-center space-x-8">
        <a
            href={resolve('/')}
            class="transition-colors hover:text-gray-300"
            class:font-bold={is_active('/')}
            >Home</a
        >
        <a
            href={resolve('/peer-to-peer')}
            class="transition-colors hover:text-gray-300"
            class:font-bold={is_active('/peer-to-peer')}
            >Peer-to-peer</a
        >
        <a
            href={resolve('/slider')}
            class="transition-colors hover:text-gray-300"
            class:font-bold={is_active('/slider')}
            >Slider</a
        >
        <a
            href={resolve('/video-player')}
            class="transition-colors hover:text-gray-300"
            class:font-bold={is_active('/video-player')}
            >Video player</a
        >
        <a
            href={resolve('/rooms')}
            class="transition-colors hover:text-gray-300"
            class:font-bold={is_active('/rooms') || is_active('/room')}
            >Rooms</a
        >
    </div>
</nav>
