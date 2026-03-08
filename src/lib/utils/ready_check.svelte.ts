import toast from "svelte-5-french-toast"
import { APP_CONFIG } from "$lib/config"
import { temp_state } from "$lib/temporary-storage.svelte"

// This is unused, call ready check simply via p2p_send_ready_check()
export const ready_check = $state({ active: false })
export function handle_ready_check() {
    if (ready_check.active) {
        return
    }

    ready_check.active = true

    setTimeout(() => {
        console.log("Ready check ended")

        ready_check.active = false
        if (temp_state.ready_peers.size - 1 < temp_state.peer_connections.length) {
            console.log("Peers not ready")
            toast("Peers not ready")
        }
        temp_state.ready_peers = new Set()
    }, APP_CONFIG.ready_check_delay_ms)
}

export function handle_ready_success() {
    if (ready_check.active === true) {
        console.log("Ready check success")
        toast.success("Peers ready", { position: APP_CONFIG.toast_location })
        ready_check.active = false
        return true
    }
}
