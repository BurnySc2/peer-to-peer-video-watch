export const APP_CONFIG = {
    subtitles_default_on: false,
    ready_check_delay_ms: 7000,
    toast_location: "top-right",
    allowed_emote_origins: [
        "https://cdn.7tv.app",
        "https://cdn.betterttv.net",
        "https://media1.tenor.com",
    ] as readonly string[],
    emote_send_cooldown_ms: 1_000,
    emote_expire_ms: 12_000,
} as const
