<script lang="ts">
let { children } = $props()

// Single file upload state
let single_file_input = $state<HTMLInputElement | null>(null)
let single_file = $state<File | null>(null)
let single_file_meta = $state<{
	name: string
	size: string
	type: string
	last_modified: string
	size_bytes: number
} | null>(null)
let single_file_error = $state<string | null>(null)

// Multiple files upload state
let multiple_files_input = $state<HTMLInputElement | null>(null)
let multiple_files = $state<FileList | null>(null)
let multiple_files_meta = $state<
	{
		id: number
		name: string
		size: string
		type: string
		last_modified: string
		size_bytes: number
	}[]
>([])
let multiple_files_error = $state<string | null>(null)

// Drag and drop state
let drag_over_single = $state(false)
let drag_over_multiple = $state(false)

// File utilities
const format_file_size = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes"
	const k = 1024
	const sizes = ["Bytes", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

const get_file_type = (file: File): string => {
	if (file.type) return file.type
	const ext = file.name.split(".").pop()?.toLowerCase() || ""
	const type_map: Record<string, string> = {
		txt: "text/plain",
		html: "text/html",
		css: "text/css",
		js: "application/javascript",
		json: "application/json",
		png: "image/png",
		jpg: "image/jpeg",
		gif: "image/gif",
		pdf: "application/pdf",
		zip: "application/zip",
	}
	return type_map[ext] || "application/octet-stream"
}

// Single file handlers
const handle_single_file_select = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]

	if (!file) {
		single_file_error = "No file selected"
		return
	}

	single_file = file
	single_file_error = null
	single_file_meta = {
		name: file.name,
		size: format_file_size(file.size),
		type: get_file_type(file),
		last_modified: new Date(file.lastModified).toLocaleString(),
		size_bytes: file.size,
	}
}

const clear_single_file = () => {
	single_file = null
	single_file_meta = null
	single_file_error = null
	if (single_file_input) {
		single_file_input.value = ""
	}
}

// Multiple files handlers
const handle_multiple_files_select = (event: Event) => {
	const target = event.target as HTMLInputElement
	const files_list = target.files

	if (!files_list || files_list.length === 0) {
		multiple_files_error = "No files selected"
		return
	}

	multiple_files = files_list
	multiple_files_error = null
	multiple_files_meta = Array.from(files_list).map((file, index) => ({
		id: index,
		name: file.name,
		size: format_file_size(file.size),
		type: get_file_type(file),
		last_modified: new Date(file.lastModified).toLocaleString(),
		size_bytes: file.size,
	}))
}

const clear_multiple_files = () => {
	multiple_files = null
	multiple_files_meta = []
	multiple_files_error = null
	if (multiple_files_input) {
		multiple_files_input.value = ""
	}
}

// Drag and drop handlers
const handle_drag_over = (e: DragEvent, target: "single" | "multiple") => {
	e.preventDefault()
	e.stopPropagation()
	if (target === "single") drag_over_single = true
	else drag_over_multiple = true
}

const handle_drag_leave = (e: DragEvent, target: "single" | "multiple") => {
	e.preventDefault()
	e.stopPropagation()
	if (target === "single") drag_over_single = false
	else drag_over_multiple = false
}

const handle_drop = (e: DragEvent, target: "single" | "multiple") => {
	e.preventDefault()
	e.stopPropagation()

	const dt = e.dataTransfer
	if (!dt || !dt.files || dt.files.length === 0) return

	const files = dt.files

	if (target === "single" && files.length === 1) {
		const file = files[0]
		single_file = file
		single_file_error = null
		single_file_meta = {
			name: file.name,
			size: format_file_size(file.size),
			type: get_file_type(file),
			last_modified: new Date(file.lastModified).toLocaleString(),
			size_bytes: file.size,
		}
		drag_over_single = false
	} else if (target === "multiple") {
		multiple_files = files
		multiple_files_error = null
		multiple_files_meta = Array.from(files).map((file, index) => ({
			id: index,
			name: file.name,
			size: format_file_size(file.size),
			type: get_file_type(file),
			last_modified: new Date(file.lastModified).toLocaleString(),
			size_bytes: file.size,
		}))
		drag_over_multiple = false
	}
}

// Calculate total size for multiple files
$effect(() => {
	if (multiple_files_meta.length > 0) {
		const total_bytes = multiple_files_meta.reduce((sum, file) => sum + file.size_bytes, 0)
		console.log(`Total size: ${format_file_size(total_bytes)} for ${multiple_files_meta.length} files`)
	}
})
</script>

<div class="min-h-screen bg-gray-50 px-4 py-8">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">File Upload Demo</h1>
			<p class="text-gray-600">Single file and multiple files upload with metadata display</p>
		</div>

		<div class="mb-8 grid gap-8 lg:grid-cols-2">
			<!-- Single File Upload -->
			<div class="rounded-lg border bg-white p-6 shadow">
				<h2 class="mb-4 text-lg font-semibold text-blue-600">Single File</h2>

				<!-- Upload button area -->
				<div
					role="button"
					tabindex="0"
					class="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors"
					class:border-blue-300={drag_over_single}
					class:bg-blue-50={drag_over_single}
					class:border-gray-300={!drag_over_single}
					ondragover={(e) => handle_drag_over(e, 'single')}
					ondragleave={(e) => handle_drag_leave(e, 'single')}
					ondrop={(e) => handle_drop(e, 'single')}
					onclick={() => single_file_input?.click()}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							single_file_input?.click()
						}
					}}
					aria-label={drag_over_single ? 'Drop file here' : 'Click to upload or drag file'}
				>
					<svg class="mx-auto mb-3 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					<p class="mb-1 text-sm font-medium text-gray-900">
						{drag_over_single ? 'Drop file here' : 'Click to upload or drag file'}
					</p>
					<p class="text-xs text-gray-500">PNG, JPG, PDF, TXT (max 10MB)</p>
				</div>

				<input
					bind:this={single_file_input}
					type="file"
					class="hidden"
					accept="image/*,application/pdf,text/plain,.doc,.docx"
					onchange={handle_single_file_select}
				/>

				<!-- Error -->
				{#if single_file_error}
					<div class="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
						{single_file_error}
					</div>
				{/if}

				<!-- File info -->
				{#if single_file_meta}
					<div class="mt-4 rounded border border-blue-200 bg-blue-50 p-4">
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-gray-600">Name:</span>
								<span class="font-medium">{single_file_meta.name}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Size:</span>
								<span class="font-medium">{single_file_meta.size}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Type:</span>
								<span class="font-medium">{single_file_meta.type}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Modified:</span>
								<span class="font-medium">{single_file_meta.last_modified}</span>
							</div>
						</div>
						<button
							onclick={clear_single_file}
							class="mt-3 w-full rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
						>
							Clear File
						</button>
					</div>
				{/if}
			</div>

			<!-- Multiple Files Upload -->
			<div class="rounded-lg border bg-white p-6 shadow">
				<h2 class="mb-4 text-lg font-semibold text-green-600">Multiple Files</h2>

				<!-- Upload button area -->
				<div
					role="button"
					tabindex="0"
					class="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors"
					class:border-green-300={drag_over_multiple}
					class:bg-green-50={drag_over_multiple}
					class:border-gray-300={!drag_over_multiple}
					ondragover={(e) => handle_drag_over(e, 'multiple')}
					ondragleave={(e) => handle_drag_leave(e, 'multiple')}
					ondrop={(e) => handle_drop(e, 'multiple')}
					onclick={() => multiple_files_input?.click()}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							multiple_files_input?.click()
						}
					}}
					aria-label={drag_over_multiple ? 'Drop files here' : 'Click to select multiple files'}
				>
					<svg class="mx-auto mb-3 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2H5.5M4 7h11.172a4 4 0 01.858.1M9.5 16l1.5-1.5L13 20l-1.5 1.5L9.5 16zM5 13a4 4 0 01-4-4V5a2 2 0 012-2h6.172a2 2 0 01.858.5l4.5 5a2 2 0 010 2.828l-4.5 5a2 2 0 01-.858.5H5a2 2 0 01-2-2z"
						/>
					</svg>
					<p class="mb-1 text-sm font-medium text-gray-900">
						{drag_over_multiple ? 'Drop files here' : 'Click to select multiple files'}
					</p>
					<p class="text-xs text-gray-500">Select multiple files</p>
				</div>

				<input
					bind:this={multiple_files_input}
					type="file"
					multiple
					class="hidden"
					onchange={handle_multiple_files_select}
				/>

				<!-- Error -->
				{#if multiple_files_error}
					<div class="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
						{multiple_files_error}
					</div>
				{/if}

				<!-- Files list -->
				{#if multiple_files_meta && multiple_files_meta.length > 0}
					<div class="mt-4 max-h-64 overflow-y-auto">
						<div class="mb-3 rounded border bg-green-50 p-3">
							<div class="flex justify-between text-sm font-medium text-green-800">
								<span>{multiple_files_meta.length} file{multiple_files_meta.length !== 1 ? 's' : ''}</span>
								<span class="text-green-600">
									{format_file_size(multiple_files_meta.reduce((sum, f) => sum + f.size_bytes, 0))}
								</span>
							</div>
						</div>

						<div class="space-y-2">
							{#each multiple_files_meta as file (file.id)}
								<div class="flex items-center justify-between rounded border bg-white p-2 text-sm">
									<div class="flex items-center truncate">
										<div class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gray-100">
											<svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
										</div>
										<div class="truncate">
											<p class="font-medium text-gray-900">{file.name}</p>
											<p class="text-xs text-gray-500">{file.type}</p>
										</div>
									</div>
									<span class="ml-2 text-gray-500">{file.size}</span>
								</div>
							{/each}
						</div>

						<button
							onclick={clear_multiple_files}
							class="mt-3 w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
						>
							Clear Files
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{@render children?.()}
