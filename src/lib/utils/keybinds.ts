type KeybindActions = {
    toggle_play_pause: () => void
    toggle_fullscreen: () => void
    seek_forward: () => void
    seek_back: () => void
}

export function register_keybinds({ toggle_play_pause, toggle_fullscreen, seek_forward, seek_back }: KeybindActions) {
    function handle_keydown(e: KeyboardEvent) {
        const tag = (e.target as HTMLElement).tagName.toLocaleLowerCase()
        if (tag === "input" || tag === "textarea" || (e.target as HTMLElement).isContentEditable) {
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
        }
    }

    window.addEventListener("keydown", handle_keydown)

    return () => {
        window.removeEventListener("keydown", handle_keydown)
    }
}
