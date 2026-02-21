export async function load() {
	// Simulate fake data on first load
	const fake_data = {
		title: "Fetch Example",
		initial_fact: "This is a fake fact loaded on first render!",
		timestamp: new Date().toISOString(),
		loading: false,
		dog_fact: null as string | null,
	}

	return fake_data
}
