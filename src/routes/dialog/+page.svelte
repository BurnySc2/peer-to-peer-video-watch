<script lang="ts">
let { children } = $props()

let show_dialog = $state(false)
let action_message = $state("")

const open_dialog = () => {
	show_dialog = true
}

const close_dialog = (event?: MouseEvent | KeyboardEvent) => {
	if (event instanceof KeyboardEvent && event.key === "Escape") {
		show_dialog = false
		return
	}
	if (event instanceof MouseEvent && (event.target as HTMLElement).classList.contains("fixed")) {
		show_dialog = false
	} else if (!event) {
		show_dialog = false
	}
}

const confirm_action = () => {
	action_message = "Action confirmed!"
	close_dialog()
}
</script>

<h1 class="p-8 text-2xl font-bold">Dialog Example</h1>

<div class="p-8">
	<button onclick={open_dialog} class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
		Open Dialog
	</button>
</div>

{#if action_message}
	<div class="p-8">
		<p class="text-green-600">{action_message}</p>
	</div>
{/if}

{#if show_dialog}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
		role="presentation"
		onclick={close_dialog}
		onkeydown={close_dialog}
		tabindex="-1"
	>
		<div
			class="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			tabindex="-1"
		>
			<h2 id="dialog-title" class="mb-4 text-lg font-semibold">Are you sure?</h2>
			<div class="flex justify-end space-x-3">
				<button onclick={() => close_dialog()} class="rounded px-4 py-2 text-gray-600 hover:bg-gray-100" type="button">
					Cancel
				</button>
				<button onclick={confirm_action} class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600" type="button">
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}

{@render children?.()}
