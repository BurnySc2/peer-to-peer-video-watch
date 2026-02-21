<script lang="ts">
import { page } from "$app/state"

// Parse query parameters from URL
let query_params = $derived.by(() => {
	const url = new URL(page.url)
	const params = new URLSearchParams(url.search)
	const result: Record<string, string> = {}

	for (const [key, value] of params) {
		result[key] = value
	}

	return result
})

// Input field state
let new_key = $state("")
let new_value = $state("")

// Add query parameter
let add_param = () => {
	if (new_key.trim()) {
		const url = new URL(page.url)
		url.searchParams.set(new_key.trim(), new_value.trim() || "")
		window.location.href = url.toString()
	}
	new_key = ""
	new_value = ""
}

// Remove query parameter
let remove_param = (key: string) => {
	const url = new URL(page.url)
	url.searchParams.delete(key)
	window.location.href = url.toString()
}

// Format JSON for display
let formatted_json = $derived.by(() => {
	return JSON.stringify(query_params, null, 2)
})
</script>

<main class="mx-auto flex max-w-2xl flex-col items-center gap-6 p-6">
	<h1 class="text-3xl font-bold text-gray-800">Query Parameters Demo</h1>
	
	<div class="w-full">
		<h2 class="text-xl font-semibold text-gray-700 mb-4">Add Query Parameter</h2>
		<div class="flex gap-2">
			<input
				type="text"
				class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
				bind:value={new_key}
				placeholder="Parameter key (e.g., hello)"
			/>
			<input
				type="text"
				class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
				bind:value={new_value}
				placeholder="Parameter value (e.g., world)"
			/>
			<button onclick={add_param} class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
				Add
			</button>
		</div>
	</div>

	<div class="w-full">
		<h2 class="text-xl font-semibold text-gray-700 mb-4">Current Query Parameters</h2>
		{#if Object.keys(query_params).length > 0}
			<div class="mb-4">
				{#each Object.entries(query_params) as [key, value]}
					<div class="flex items-center gap-2 mb-2">
						<span class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{key}={value}</span>
						<button 
							onclick={() => remove_param(key)}
							class="text-red-600 hover:text-red-800 text-sm"
						>
							Remove
						</button>
					</div>
				{/each}
			</div>
			<div class="bg-gray-100 p-4 rounded-lg">
				<h3 class="text-lg font-medium text-gray-700 mb-2">As JSON:</h3>
				<pre class="bg-white p-4 rounded border overflow-x-auto"><code>{formatted_json}</code></pre>
			</div>
		{:else}
			<div class="text-gray-500 text-center py-8">
				No query parameters found. Add some above to see them displayed as JSON.
			</div>
		{/if}
	</div>

	<div class="w-full">
		<h2 class="text-xl font-semibold text-gray-700 mb-4">Current URL</h2>
		<div class="bg-gray-100 p-4 rounded-lg">
			<code class="text-sm break-all">{page.url.toString()}</code>
		</div>
	</div>
</main>