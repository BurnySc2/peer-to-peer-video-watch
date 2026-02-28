<script lang="ts">
import { onMount } from "svelte"

// TODO: Uplaod video file and split it into chunks / segments
// TODO: Read video metadata
let { children } = $props()

// Video
// let video_element = $state<HTMLVideoElement>(new HTMLVideoElement())
let media_source_local = $state<MediaSource>()
let video_url = $state("")

// Single file upload state
let single_file_input = $state<HTMLInputElement | null>(null)
let single_file = $state<File | null>(null)
let single_file_meta = $state<{
    name: string
    size: number
    type: string
    last_modified: string
    size_bytes: number
} | null>(null)
let single_file_error = $state<string | null>(null)

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
        size: file.size,
        type: file.type,
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

function get_video_metadata(file: File) {
    return new Promise((resolve, reject) => {
        console.log(file)

        // Only process video files
        if (!file.type.startsWith("video/")) {
            reject(new Error("Not a video file"))
            return
        }

        const video = document.createElement("video")
        // Important: preload="metadata" tells browser to load just metadata (usually < 1 MB)
        video.preload = "metadata"

        // Use object URL (revoke it later to free memory)
        const url = URL.createObjectURL(file)
        video.src = url

        video.onloadedmetadata = () => {
            // Clean up
            URL.revokeObjectURL(url)

            resolve({
                name: file.name,
                size: file.size, // bytes
                type: file.type, // e.g. "video/mp4"
                duration: video.duration, // seconds (float)
                width: video.videoWidth, // intrinsic pixel width
                height: video.videoHeight, // intrinsic pixel height
            })
        }

        video.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error("Failed to load video metadata"))
        }

        // Some browsers need this kick
        video.load()
    })
}

// Drag and drop handlers
const handle_drag_over = (e: DragEvent, target: "single" | "multiple") => {
    e.preventDefault()
    e.stopPropagation()
}

const handle_drag_leave = (e: DragEvent, target: "single" | "multiple") => {
    e.preventDefault()
    e.stopPropagation()
}

const handle_drop = async (e: DragEvent, target: "single" | "multiple") => {
    e.preventDefault()
    e.stopPropagation()

    const dt = e.dataTransfer
    if (!dt || !dt.files || dt.files.length === 0) return

    const files = dt.files

    if (files.length === 1) {
        const file = files[0]
        single_file = file
        single_file_error = null
        single_file_meta = {
            name: file.name,
            size: file.size,
            type: file.type,
            last_modified: new Date(file.lastModified).toLocaleString(),
            size_bytes: file.size,
        }

        // Get metadata
        const meta_info = await get_video_metadata(file)
        console.log(meta_info)

        // video_element.src = file.
        if (video_url) {
            URL.revokeObjectURL(video_url)
        }
        video_url = URL.createObjectURL(file)
    }
}
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
                    class:border-blue-300={true}
                    class:bg-blue-50={true}
                    class:border-gray-300={!true}
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
                    aria-label={true ? 'Drop file here' : 'Click to upload or drag file'}
                >
                    <svg
                        class="mx-auto mb-3 h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <p class="mb-1 text-sm font-medium text-gray-900">
                        {true ? 'Drop file here' : 'Click to upload or drag file'}
                    </p>
                    <p class="text-xs text-gray-500">PNG, JPG, PDF, TXT (max 10MB)</p>
                </div>

                <input
                    bind:this={single_file_input}
                    type="file"
                    class="hidden"
                    accept="image/*,application/pdf,text/plain,.doc,.docx"
                    onchange={handle_single_file_select}
                >

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
                {#if video_url}
                    <video
                        controls
                        autoplay
                        muted
                        playsinline
                        src={video_url}
                        style="max-width: 100%; max-height: 60vh; border-radius: 8px;"
                    >
                        Your browser does not support the video tag.
                    </video>
                {/if}
            </div>
        </div>
    </div>
</div>

{@render children?.()}
