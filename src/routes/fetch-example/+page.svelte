<script lang="ts">
type Props = {
	data: {
		title: string
		initial_fact: string
		timestamp: string
		loading: boolean
		dog_fact: string | null
	}
}

let { data }: Props = $props()

let loading = $state(data.loading)
let dog_fact = $state(data.dog_fact)
let error = $state<string | null>(null)

async function fetch_dog_fact() {
	loading = true
	error = null

	try {
		const response = await fetch("https://dogapi.dog/api/v2/facts?limit=1")

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const result = await response.json()
		dog_fact = result.data[0].attributes.body
	} catch (err) {
		error = err instanceof Error ? err.message : "Failed to fetch dog fact"
	} finally {
		loading = false
	}
}
</script>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-6">{data.title}</h1>
  
  <div class="bg-gray-100 p-6 rounded-lg mb-6">
    <h2 class="text-xl font-semibold mb-2">Initial Data</h2>
    <p class="mb-2"><strong>Fake Fact:</strong> {data.initial_fact}</p>
    <p><strong>Loaded at:</strong> {data.timestamp}</p>
  </div>

  <div class="mb-6">
    <button
      onclick={fetch_dog_fact}
      disabled={loading}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading...' : 'Fetch Dog Fact'}
    </button>
  </div>

  {#if dog_fact}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <h3 class="font-semibold mb-2">Dog Fact:</h3>
      <p>{dog_fact}</p>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <h3 class="font-semibold mb-2">Error:</h3>
      <p>{error}</p>
    </div>
  {/if}
</div>