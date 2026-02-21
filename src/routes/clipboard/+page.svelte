<script lang="ts">
import { browser } from "$app/environment"

let { children } = $props()

// Simple state
let status_msg = $state("Ready")
let copied_text = $state("")
let pasted_text = $state("")

// Copy to clipboard - main function
const copy_text = async (text: string) => {
	if (!browser) {
		return
	}

	try {
		await navigator.clipboard.writeText(text)
		copied_text = text
		status_msg = "Copied!"
		setTimeout(() => {
			status_msg = "Ready"
		}, 1500)
	} catch (err) {
		status_msg = "Copy failed"
		console.error(err)
	}
}

// Paste from clipboard - main function
const paste_text = async () => {
	if (!browser) {
		return
	}

	try {
		const text = await navigator.clipboard.readText()
		pasted_text = text
		status_msg = "Pasted!"
		setTimeout(() => {
			status_msg = "Ready"
		}, 1500)
	} catch (err) {
		status_msg = "Paste failed (needs permission)"
		console.error(err)
	}
}

// Quick copy examples
const copy_hello = () => copy_text("Hello World!")
const copy_url = () => copy_text(window.location.href)
</script>

<div class="mx-auto max-w-2xl space-y-6 p-8">
	<h1 class="text-2xl font-bold">Clipboard API Quick Reference</h1>

	<!-- Status -->
	<div class="rounded border bg-blue-50 p-3">
		<strong>Status:</strong>
		{status_msg}
	</div>

	<!-- Copy Examples -->
	<div class="space-y-3">
		<h2 class="font-semibold">Copy Examples</h2>

		<button onclick={copy_hello} class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
			Copy "Hello World!"
		</button>

		<button onclick={copy_url} class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
			Copy Current URL
		</button>

		{#if copied_text}
			<div class="rounded bg-gray-100 p-2 text-sm">
				Last copied: <code>{copied_text}</code>
			</div>
		{/if}
	</div>

	<!-- Paste Example -->
	<div class="space-y-3">
		<h2 class="font-semibold">Paste Example</h2>

		<button onclick={paste_text} class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
			Paste from Clipboard
		</button>

		{#if pasted_text}
			<div class="max-h-20 overflow-auto rounded bg-gray-100 p-2 text-sm">
				Pasted: <code>{pasted_text}</code>
			</div>
		{/if}
	</div>

	<!-- Quick Reference Code -->
	<div class="rounded bg-gray-900 p-4 text-sm text-white">
		<h3 class="mb-2 font-bold">Quick Reference Code</h3>
		<pre class="whitespace-pre-wrap"><code
				>// Copy
await navigator.clipboard.writeText('your text')

// Paste  
const text = await navigator.clipboard.readText()

// Requirements:
- HTTPS or localhost
- User interaction (button click)
- Modern browser (Chrome 66+, Firefox 63+)</code
			></pre>
	</div>
</div>

{@render children?.()}
