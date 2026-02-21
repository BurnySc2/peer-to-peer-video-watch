<script lang="ts">
import { perma_state } from "$lib/persistent-storage.svelte"
</script>

<div
	class="flex min-h-[80px] items-center justify-center rounded-lg border border-blue-200 bg-white p-6 text-center shadow-md"
>
	<div>
		<div class="mb-1 text-2xl font-bold text-blue-600">
			{perma_state.data.my_counter_state}
		</div>
		<div class="text-sm text-gray-500">Value from CounterState component</div>
	</div>
</div>
