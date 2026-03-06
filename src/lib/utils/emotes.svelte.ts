const emoteModules = import.meta.glob("$lib/emotes/*.{png,gif,webp,jpg,jpeg,avif}", { eager: true })

export const emotes: string[] = Object.values(emoteModules).map((m: any) => m.default)

export const emote_state: { id: string; src: string }[] = $state<{ id: string; src: string }[]>([])
