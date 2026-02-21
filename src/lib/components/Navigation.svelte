<script lang="ts">
import { resolve } from "$app/paths"
import { page } from "$app/state"

const is_active = (path: string) => page.url.pathname.includes(path)
</script>

<nav class="bg-gray-800 p-4 text-white">
	<div class="container mx-auto flex justify-center space-x-8">
		<a href={resolve('/')} class="transition-colors hover:text-gray-300 {is_active('/') ? 'font-bold' : ''}">Home</a>
		<a
			href={resolve('/my-localstorage')}
			class="transition-colors hover:text-gray-300 {is_active('/my-localstorage') ? 'font-bold' : ''}">Local Storage</a
		>
		<a href={resolve('/auth')} class="transition-colors hover:text-gray-300 {is_active('/auth') ? 'font-bold' : ''}"
			>Auth</a
		>
		<a href={resolve('/upload')} class="transition-colors hover:text-gray-300 {is_active('/upload') ? 'font-bold' : ''}"
			>Upload</a
		>
		<a href={resolve('/dialog')} class="transition-colors hover:text-gray-300 {is_active('/dialog') ? 'font-bold' : ''}"
			>Dialog</a
		>
		<a href={resolve('/tables')} class="transition-colors hover:text-gray-300 {is_active('/tables') ? 'font-bold' : ''}"
			>Tables</a
		>
		<a href={resolve('/charts')} class="transition-colors hover:text-gray-300 {is_active('/charts') ? 'font-bold' : ''}"
			>Charts</a
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
	</div>
</nav>
