<script lang="ts">
let { children } = $props()
let auth_status: { authenticated: boolean; user: string | null } = $state({ authenticated: false, user: null })
let is_loading = $state(true)

// Async function for loading auth status
const on_load_request = async () => {
	try {
		const response = await fetch("https://burnysc2.xyz/login/api_status", {
			// Ensures cookies are sent with the request
			credentials: "include",
		})

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`)
		}

		auth_status = await response.json()
	} catch (error) {
		console.error("Auth status fetch failed:", error)
		auth_status = { authenticated: false, user: null }
	} finally {
		is_loading = false
	}
}

// Trigger load when component mounts using $effect
$effect(() => {
	on_load_request()
})
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
				<svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Authentication Status</h2>
			<p class="mt-2 text-center text-sm text-gray-600">Check your login status with external authentication service</p>
		</div>

		<div class="rounded-lg bg-white px-6 py-8 shadow sm:px-10">
			{#if is_loading}
				<div class="flex items-center justify-center py-12">
					<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<p class="ml-3 text-sm font-medium text-gray-600">Checking authentication...</p>
				</div>
			{:else if auth_status.authenticated}
				<div class="space-y-6 text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
						<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					</div>

					<div class="space-y-4">
						<h3 class="text-2xl font-bold text-gray-900">Welcome back!</h3>
						<p class="text-xl text-gray-600">
							Hello, <span class="font-semibold text-gray-900">{auth_status.user}</span>
						</p>
						<p class="text-sm text-gray-500">You are successfully authenticated with the external service.</p>
					</div>

					<div class="border-t border-gray-200 pt-6">
						<a
							href="https://burnysc2.xyz/login"
							class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						>
							Manage Account
						</a>
					</div>
				</div>
			{:else}
				<div class="space-y-6 text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
						<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>

					<div class="space-y-4">
						<h3 class="text-2xl font-bold text-gray-900">Not authenticated</h3>
						<p class="text-gray-600">You are not currently logged in.</p>
						<p class="text-sm text-gray-500">Click below to authenticate with the external service.</p>
					</div>

					<div class="border-t border-gray-200 pt-6">
						<a
							href="https://burnysc2.xyz/login"
							class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						>
							<span class="flex items-center justify-center gap-2">
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									/>
								</svg>
								Log in to External Service
							</span>
						</a>
					</div>

					<div class="text-center text-xs text-gray-400">
						<p>Using fetch with credentials: 'include' for cookie-based auth</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Error fallback -->
		{#if !is_loading && !auth_status}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<div class="flex items-center">
					<svg class="mr-2 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p class="text-sm text-red-800">Failed to load authentication status. Please refresh the page.</p>
				</div>
			</div>
		{/if}
	</div>
</div>

{@render children?.()}

<style>
	/* Custom loading spinner animation */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
