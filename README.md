# Peer to Peer video platform

A svelte based peer-to-peer video watching platform using PeerJS.
Users share a direct video URL and synchronise playback in real time.

Jellyfin URLs include additional integration features, such as expanding a single episode into an entire season playlist.

![Main UI](screenshots/main_view.png)

## Features

- Synchronised video playback; play/pause/seek/playback speed
- Custom built video controls
- Custom built subtitles parser, including size and offset controls;
![Main UI](screenshots/ready_check.png)
- "Ready check" function - check connected peers are ready before video plays
- Emote system - send emoji reactions to connected peers, overlaying on video
- Autoplay and Sleep timer functionality

## Tech Stack

- SvelteKit
- TypeScript
- PeerJS
- TailwindCSS

## Installation

Install with npm:
```sh
npm install
```

Run local version
```sh
npm run dev
```

### Update typescript types

There may be a problem keeping the types up to date with the backend api.

While backend is running under, you can run

```sh
npx openapi-typescript http://localhost:8000/schema/openapi.json --output src/lib/types/api.ts
```

to update the types of the endpoints.

## Building

To create a production version:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
