<script lang="ts">
import { resolve } from "$app/paths"
import { page } from "$app/state"

const is_active = (path: string) => page.url.pathname.includes(path)
</script>

<nav class="bg-gray-800 p-4 text-white">
	<div class="container mx-auto flex justify-center space-x-8">
		<a href={resolve('/')} class="transition-colors hover:text-gray-300 {is_active('/') ? 'font-bold' : ''}">Home</a>
		<a href={resolve('/upload')} class="transition-colors hover:text-gray-300 {is_active('/upload') ? 'font-bold' : ''}"
			>Upload</a
		>
		<a href={resolve('/dialog')} class="transition-colors hover:text-gray-300 {is_active('/dialog') ? 'font-bold' : ''}"
			>Dialog</a
		>
		<a
			href={resolve('/clipboard')}
			class="transition-colors hover:text-gray-300 {is_active('/clipboard') ? 'font-bold' : ''}">Clipboard</a
		>
		<a
			href={resolve('/download')}
			class="transition-colors hover:text-gray-300 {is_active('/download') ? 'font-bold' : ''}">Download</a
		>
		<a
			href={resolve('/query-params')}
			class="transition-colors hover:text-gray-300 {is_active('/query-params') ? 'font-bold' : ''}">Query Params</a
		>
		<a
			href={resolve('/fetch-example')}
			class="transition-colors hover:text-gray-300 {is_active('/fetch-example') ? 'font-bold' : ''}">Fetch Example</a
		>
		<a
			href={resolve('/peer-to-peer')}
			class="transition-colors hover:text-gray-300 {is_active('/peer-to-peer') ? 'font-bold' : ''}">Peer-to-peer</a
		>
		<a
			href={resolve('/video-player')}
			class="transition-colors hover:text-gray-300 {is_active('/video-player') ? 'font-bold' : ''}">Video player</a
		>
		<a
			href={resolve('/p2p-video')}
			class="transition-colors hover:text-gray-300 {is_active('/video-player') ? 'font-bold' : ''}">P2P video player</a
		>
	</div>
</nav>
