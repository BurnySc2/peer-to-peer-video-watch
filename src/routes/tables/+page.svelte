<script lang="ts">
let { children } = $props()

type Item = {
	id: number
	name: string
	price: number
	category: string
	description: string
}

let items = $state<Item[]>([
	{ id: 1, name: "Apple", price: 1.5, category: "Fruit", description: "Red apple, fresh from the orchard" },
	{ id: 2, name: "Banana", price: 0.8, category: "Fruit", description: "Yellow banana, ripe and sweet" },
	{ id: 3, name: "Carrot", price: 0.5, category: "Vegetable", description: "Orange carrot, crunchy and nutritious" },
	{ id: 4, name: "Bread", price: 2.0, category: "Bakery", description: "Whole wheat bread, freshly baked" },
])

let hovered_item = $state<Item | null>(null)
let show_tooltip = $state(false)
let tooltip_position = $state({ x: 0, y: 0 })
let current_target = $state<HTMLElement | null>(null)
let hover_timeout: number | null = null

const show_tooltip_after_delay = (event: MouseEvent, item: Item) => {
	event.preventDefault()
	current_target = event.currentTarget as HTMLElement
	const mouse_x = event.clientX
	const mouse_y = event.clientY
	if (hover_timeout) clearTimeout(hover_timeout)
	hover_timeout = setTimeout(() => {
		if (!current_target) return

		hovered_item = item
		show_tooltip = true
		tooltip_position = {
			x: mouse_x + 10,
			y: mouse_y - 10,
		}
	}, 500)
}

const hide_tooltip = () => {
	if (hover_timeout) {
		clearTimeout(hover_timeout)
		hover_timeout = null
	}
	show_tooltip = false
	hovered_item = null
	current_target = null
}
</script>

<h1 class="p-8 text-2xl font-bold">Tables Example</h1>

<div class="overflow-x-auto p-8">
	<table class="min-w-full border-collapse border border-gray-300">
		<thead>
			<tr class="bg-gray-100">
				<th class="border border-gray-300 px-4 py-2 text-left">ID</th>
				<th class="border border-gray-300 px-4 py-2 text-left">Name</th>
				<th class="border border-gray-300 px-4 py-2 text-left">Price</th>
				<th class="border border-gray-300 px-4 py-2 text-left">Category</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item (item.id)}
				<tr class="hover:bg-gray-50">
					<td class="border border-gray-300 px-4 py-2">{item.id}</td>
					<td
						class="relative cursor-help border border-gray-300 px-4 py-2"
						onmouseenter={(e) => show_tooltip_after_delay(e, item)}
						onmouseleave={hide_tooltip}
					>
						{item.name}
						{#if show_tooltip && hovered_item?.id === item.id}
							<div
								class="fixed z-50 rounded bg-gray-800 px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg"
								style="left: {tooltip_position.x}px; top: {tooltip_position.y}px;"
							>
								{hovered_item.description}
							</div>
						{/if}
					</td>
					<td class="border border-gray-300 px-4 py-2">${item.price}</td>
					<td class="border border-gray-300 px-4 py-2">{item.category}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<h2 class="p-8 text-xl font-semibold">Flex Layout Example</h2>
<div class="space-y-4 p-8">
	{#each items as item (item.id)}
		<div class="flex items-center space-x-4 rounded border border-gray-300 p-4 hover:bg-gray-50">
			<div class="w-12 text-center">{item.id}</div>
			<div
				role="button"
				tabindex="0"
				class="relative flex-1 cursor-help"
				onmouseenter={(e) => show_tooltip_after_delay(e, item)}
				onmouseleave={hide_tooltip}
			>
				{item.name}
				{#if show_tooltip && hovered_item?.id === item.id}
					<div
						class="fixed z-50 rounded bg-gray-800 px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg"
						style="left: {tooltip_position.x}px; top: {tooltip_position.y}px;"
					>
						{hovered_item.description}
					</div>
				{/if}
			</div>
			<div class="w-20">${item.price}</div>
			<div class="w-24">{item.category}</div>
		</div>
	{/each}
</div>

<h2 class="p-8 text-xl font-semibold">Grid Layout Example</h2>
<div class="p-8">
	<div class="grid grid-cols-4 gap-4">
		{#each items as item (item.id)}
			<div class="rounded border border-gray-300 p-4 hover:bg-gray-50">
				<div class="mb-1 text-center font-medium">{item.id}</div>
				<div
					role="button"
					tabindex="0"
					class="relative cursor-help text-center"
					onmouseenter={(e) => show_tooltip_after_delay(e, item)}
					onmouseleave={hide_tooltip}
				>
					{item.name}
					{#if show_tooltip && hovered_item?.id === item.id}
						<div
							class="fixed z-50 rounded bg-gray-800 px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg"
							style="left: {tooltip_position.x}px; top: {tooltip_position.y}px;"
						>
							{hovered_item.description}
						</div>
					{/if}
				</div>
				<div class="mt-1 text-right">${item.price}</div>
				<div class="mt-1 text-sm text-gray-600">{item.category}</div>
			</div>
		{/each}
	</div>
</div>

{@render children?.()}
