# Agent Context: peer-to-peer-video-watch

> Project analysis last updated: 2026-03-24

## Project Overview

- **Name**: peer-to-peer-video-watch
- **Type**: SvelteKit Web Application (Svelte 5)
- **Purpose**: Peer-to-peer video synchronization app enabling users to watch videos together in sync across multiple clients
- **Repository**: Local SvelteKit project with TypeScript

## Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | SvelteKit 2.x with Svelte 5 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Peer-to-Peer | PeerJS |
| Validation | Zod |
| Testing | Vitest + Playwright |
| Linting | Biome |
| Build Tool | Vite 7 |
| Adapter | @sveltejs/adapter-static |

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── Emotes.svelte
│   │   │   ├── NewControls.svelte
│   │   │   ├── PlaybackControls.svelte
│   │   │   ├── ReadyCheck.svelte
│   │   │   ├── Rooms.svelte
│   │   │   ├── Sleeping.svelte
│   │   │   ├── Subtitles.svelte
│   │   │   └── VideoPlayer.svelte
│   │   ├── Footer.svelte
│   │   └── Navigation.svelte
│   ├── icons/            # Icon components
│   ├── peer_handling/    # P2P connection logic
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   ├── config.ts         # App configuration
│   ├── persistent-storage.svelte.ts
│   └── temporary-storage.svelte.ts
├── routes/
│   ├── +layout.svelte    # Root layout
│   ├── +page.svelte      # Home page
│   ├── room/+page.svelte # Individual room
│   ├── rooms/+page.svelte # Rooms listing
│   ├── video-player/+page.svelte
│   └── peer-to-peer/+page.svelte
├── app.html
├── app.css               # Global styles
└── app.d.ts
```

## Key Features

1. **Video Player** - Custom video player with playback controls
2. **Room System** - Create/join rooms for shared viewing
3. **Peer-to-Peer Sync** - Real-time synchronization via PeerJS
4. **Emotes Support** - 7tv, BTTV, Tenor emote integration
5. **Subtitles** - Subtitle fetching and parsing
6. **Ready Check** - Synchronization checkpoint system
7. **Jellyfin Integration** - Video content from Jellyfin server
8. **Persistent Storage** - LocalStorage for user preferences

## Configuration

```typescript
// src/lib/config.ts
APP_CONFIG = {
    subtitles_default_on: false,
    ready_check_delay_ms: 7000,
    toast_location: "top-right",
    allowed_emote_origins: ["https://cdn.7tv.app", "https://cdn.betterttv.net", "https://media1.tenor.com"],
    emote_send_cooldown_ms: 1000,
    emote_expire_ms: 12000,
}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 8000, host 0.0.0.0) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type check with svelte-check |
| `npm run lint-format` | Run Biome with auto-fix |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run test` | Run all tests |
| `npm run generate-types` | Generate API types from OpenAPI |

## Development Notes

- **Dev server**: Runs on `http://0.0.0.0:8000`
- **Allowed hosts**: `preview1.burnysc2.xyz` (configured in vite.config.ts)
- **SSR**: PeerJS is externalized (not bundled for SSR)
- **Adapter**: Static adapter with 404.html fallback

## Type Generation

The project can generate TypeScript types from a backend OpenAPI schema:

```bash
npx openapi-typescript http://localhost:8000/schema/openapi.json --output src/lib/types/api.ts
```

This requires the backend to be running at localhost:8000.

## Testing

- **Unit Tests**: Vitest with browser environment (Playwright provider)
- **E2E Tests**: Playwright with test files in `e2e/` directory
- **Test Setup**: `vitest-setup-client.ts` for client-side test initialization
