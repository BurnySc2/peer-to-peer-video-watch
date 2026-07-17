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
        const allow_repeat = ["arrowright", "arrowleft"]
        const key_action_mapping = {
            " ": toggle_play_pause,
            f: toggle_fullscreen,
            arrowright: seek_forward,
            arrowleft: seek_back,
            c: toggle_custom_subtitles,
            m: toggle_mute,
        }

        const el = e.target as HTMLElement
        if (
            el.tagName === "TEXTAREA" ||
            el.isContentEditable ||
            (el.tagName === "INPUT" && (el as HTMLInputElement).type !== "range")
        ) {
            // Input element selected, ignore except range / sliders
            return
        }

        const key_pressed = e.key.toLocaleLowerCase() as keyof typeof key_action_mapping
        if (!Object.keys(key_action_mapping).includes(key_pressed)) {
            // Key has no action mapped
            return
        }

        // Key detected, handle action
        e.preventDefault()
        if (e.repeat && !allow_repeat.includes(key_pressed)) {
            // Ignore held down keys
            return
        }
        // Run action
        const action = key_action_mapping[key_pressed]
        action()
    }

    window.addEventListener("keydown", handle_keydown)

    return () => {
        window.removeEventListener("keydown", handle_keydown)
    }
}
