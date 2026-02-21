# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

```sh
# create a new project using latest sveltekit template
npx sv create my-app --template minimal --types ts --install npm
```

## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

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

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
