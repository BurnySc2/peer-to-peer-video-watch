type KeybindActions = {
    toggle_play_pause: () => void
    toggle_fullscreen: () => void
    seek_forward: () => void
    seek_back: () => void
    toggle_custom_subtitles: () => void
    toggle_mute: () => void
}

export function register_keybinds({
    toggle_play_pause,
    toggle_fullscreen,
    seek_forward,
    seek_back,
    toggle_custom_subtitles,
    toggle_mute,
}: KeybindActions) {
    function handle_keydown(e: KeyboardEvent) {
        const el = e.target as HTMLElement
        if (
            el.tagName === "TEXTAREA" ||
            el.isContentEditable ||
            (el.tagName === "INPUT" && (el as HTMLInputElement).type !== "range")
        ) {
            return
        }
        switch (e.key.toLocaleLowerCase()) {
            case " ":
                e.preventDefault()
                toggle_play_pause()
                break
            case "f":
                e.preventDefault()
                toggle_fullscreen()
                break
            case "arrowright":
                e.preventDefault()
                seek_forward()
                break
            case "arrowleft":
                e.preventDefault()
                seek_back()
                break
            case "c":
                e.preventDefault()
                toggle_custom_subtitles()
                break
            case "m":
                e.preventDefault()
                toggle_mute()
                break
        }
    }

    window.addEventListener("keydown", handle_keydown)

    return () => {
        window.removeEventListener("keydown", handle_keydown)
    }
}
