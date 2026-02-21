<script lang="ts">
import CounterState from "$lib/components/counter-state/CounterState.svelte"
import CounterWritable from "$lib/components/counter-writeable/CounterWritable.svelte"
import { perma_state } from "$lib/persistent-storage.svelte"
import { temp_state } from "$lib/temporary-storage.svelte"

// Only start rendering when javascript has loaded
let page_ready = $state(false)
$effect.pre(() => {
	page_ready = true
})
</script>

{#if page_ready}
	<div class="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl space-y-12">
			<!-- Page Header -->
			<div class="text-center">
				<h1 class="mb-2 text-4xl font-bold text-gray-900">Local Storage Examples</h1>
				<p class="mx-auto max-w-2xl text-xl text-gray-600">
					Demonstrating persistent state with Svelte 5 $state and writable stores
				</p>
			</div>

			<!-- Temporary Counter Section -->
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
				<div class="border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-6">
					<h2 class="flex items-center text-2xl font-bold text-gray-900">
						<div class="mr-3 h-2 w-2 rounded-full bg-orange-500"></div>
						Temporary Counter (In-memory only)
					</h2>
					<p class="mt-1 text-gray-600">Counter that resets on page refresh - not persisted to localStorage</p>
				</div>

				<div class="space-y-6 p-8">
					<div class="flex flex-col items-center justify-center gap-6 sm:flex-row">
						<button
							class="transform rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none active:bg-orange-800"
							onclick={() => {
								temp_state.my_temporary_counter += 1
							}}
						>
							<span class="flex items-center gap-2">
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
								</svg>
								Increment Temporary Counter
							</span>
						</button>

						<div class="text-center">
							<div class="rounded-lg bg-orange-50 px-4 py-2 text-3xl font-bold text-orange-600">
								Value: {temp_state.my_temporary_counter}
							</div>
							<p class="mt-1 text-sm text-gray-500">Lost on page refresh</p>
						</div>
					</div>
				</div>
			</div>

			<!-- $state Counter Section -->
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
				<div class="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
					<h2 class="flex items-center text-2xl font-bold text-gray-900">
						<div class="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
						$state (Reactive State)
					</h2>
					<p class="mt-1 text-gray-600">Direct state management with automatic localStorage sync</p>
				</div>

				<div class="space-y-6 p-8">
					<div class="flex flex-col items-center justify-center gap-6 sm:flex-row">
						<button
							class="transform rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none active:bg-blue-800"
							onclick={() => {
								perma_state.data.my_counter_state += 1
							}}
						>
							<span class="flex items-center gap-2">
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
								</svg>
								Increment Counter
							</span>
						</button>

						<div class="text-center">
							<div class="rounded-lg bg-blue-50 px-4 py-2 text-3xl font-bold text-blue-600">
								Value: {perma_state.data.my_counter_state}
							</div>
							<p class="mt-1 text-sm text-gray-500">Persisted in localStorage</p>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-6 border-t border-gray-100 pt-4 md:grid-cols-2">
						<CounterState />
						<CounterState />
					</div>
				</div>
			</div>

			<!-- Writable Store Section -->
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
				<div class="border-b border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6">
					<h2 class="flex items-center text-2xl font-bold text-gray-900">
						<div class="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
						Writable Store
					</h2>
					<p class="mt-1 text-gray-600">Svelte store pattern with localStorage synchronization</p>
				</div>

				<div class="space-y-6 p-8">
					<div class="flex flex-col items-center justify-center gap-6 sm:flex-row">
						<button
							class="transform rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none active:bg-green-800"
							onclick={() => {																perma_state.data.my_counter_writeable += 1
							}}
						>
							<span class="flex items-center gap-2">
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
								</svg>
								Increment Store
							</span>
						</button>

						<div class="text-center">
							<div class="rounded-lg bg-green-50 px-4 py-2 text-3xl font-bold text-green-600">
								Value: {								perma_state.data.my_counter_writeable}
							</div>
							<p class="mt-1 text-sm text-gray-500">Synced via writable store</p>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-6 border-t border-gray-100 pt-4 md:grid-cols-2">
						<CounterWritable />
						<CounterWritable />
					</div>
				</div>
			</div>

			<!-- Comparison Section -->
			<div class="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-8">
				<h2 class="mb-4 text-center text-2xl font-bold text-gray-900">Comparison: $state vs Writable Store</h2>
				<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
					<div class="space-y-3">
						<h3 class="flex items-center font-semibold text-purple-800">
							<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								></path>
							</svg>
							$state Benefits
						</h3>
						<ul class="space-y-1 text-sm text-purple-700">
							<li>• Direct reactivity without stores</li>
							<li>• Simpler syntax for component-local state</li>
							<li>• Automatic localStorage sync</li>
							<li>• Fine-grained reactivity</li>
						</ul>
					</div>

					<div class="space-y-3">
						<h3 class="flex items-center font-semibold text-emerald-800">
							<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								></path>
							</svg>
							Writable Store Benefits
						</h3>
						<ul class="space-y-1 text-sm text-emerald-700">
							<li>• Share state across components</li>
							<li>• Subscribe to changes anywhere</li>
							<li>• Traditional Svelte pattern</li>
							<li>• Works with Svelte 4/5</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
