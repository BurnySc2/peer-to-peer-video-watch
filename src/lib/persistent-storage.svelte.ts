import { browser } from "$app/environment"

export const perma_state = $state({
	loading: true,
	data: {
		my_counter_state: 0,
		my_counter_writeable: 0,
	},
})

$effect.root(() => {
	$effect.pre(() => {
		// Save data
		if (browser && !perma_state.loading) {
			localStorage.setItem("my_perma_state", JSON.stringify(perma_state.data))
		}
		// Load data
		if (browser && perma_state.loading) {
			perma_state.loading = false
			const data = localStorage.getItem("my_perma_state")
			if (data !== null) {
				perma_state.data = {
					// Set default
					...perma_state.data,
					// Set loaded values
					...JSON.parse(data),
				}
			}
		}
		$state.snapshot(perma_state.data)
	})
})
