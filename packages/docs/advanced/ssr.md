# Server Side Rendering (SSR)

This guide covers how to implement Server Side Rendering with Apollo Runes in SvelteKit applications.

## Overview

Apollo Runes provides seamless SSR support by allowing you to:
- Create Apollo clients that work on both server and client
- Pre-fetch data on the server for faster initial page loads
- Hydrate client-side components with server-fetched data
- Maintain consistent state between server and client

## Setting up Apollo Client

### 1. Create the Apollo Client Factory

First, create a factory function to generate Apollo clients for both server and client environments:

```ts
// lib/apollo.ts
import { browser } from "$app/environment";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

interface ApolloClientParams {
  token?: string;
}

export function createApolloClient({ token }: ApolloClientParams = {}) {
  return new ApolloClient({
    ssrMode: !browser,
    link: new HttpLink({
      uri: "http://localhost:3010",
      credentials: "same-origin",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }),
    cache: new InMemoryCache(),
  });
}
```

::: tip Important
Apollo Client should create **one client per request** on the server to avoid data leakage between users.
:::

### 2. Configure the Apollo Provider

Set up the Apollo provider in your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { browser } from "$app/environment";
  import { ApolloProvider } from 'apollo-runes';
  import { createApolloClient } from '$lib/apollo';

  let { children } = $props();

  // Only create client on browser for client-side operations
  const client = browser ? createApolloClient({
    token: document.cookie.match(/(^|; )token=([^;]*)/)?.[2]
  }) : null;
</script>

{#if client}
  <ApolloProvider {client}>
    {@render children()}
  </ApolloProvider>
{:else}
  {@render children()}
{/if}
```

## SSR Implementation Strategies

### Option 1: Per-Route Apollo Client

Create a new Apollo client for each server load function:

```ts
// src/routes/posts/+page.server.ts
import type { PageServerLoad } from './$types';
import { createApolloClient } from '$lib/apollo';
import { GET_POSTS } from '$lib/queries';

export const load: PageServerLoad = async ({ cookies }) => {
  const client = createApolloClient({ 
    token: cookies.get('token') 
  });

  try {
    const result = await client.query({
      query: GET_POSTS,
      errorPolicy: 'all'
    });

    return {
      posts: result.data,
      // Optionally pass errors for client handling
      ...(result.error && { apolloError: result.error })
    };
  } catch (error) {
    console.error('Failed to load posts:', error);
    return {
      posts: null,
      error: 'Failed to load posts'
    };
  }
};
```

Then use the pre-fetched data in your component:

```svelte
<!-- src/routes/posts/+page.svelte -->
<script lang="ts">
  import { Query } from 'apollo-runes';
  import { GET_POSTS } from '$lib/queries';

  let { data } = $props();

  // Use server data as initial data, enabling client-side updates
  const query = new Query(GET_POSTS, { 
    initialData: data.posts 
  });
</script>

{#if query.loading && !query.data}
  <div>Loading...</div>
{:else if query.error}
  <div>Error: {query.error.message}</div>
{:else if query.data}
  <div>
    {#each query.data.posts as post}
      <article>{post.title}</article>
    {/each}
  </div>
{/if}
```

### Option 2: Using SvelteKit Locals (Recommended)

For larger applications, use SvelteKit's `locals` to reduce boilerplate:

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createApolloClient } from '$lib/apollo';

export const handle: Handle = async ({ event, resolve }) => {
  // Create Apollo client once per request
  event.locals.apollo = createApolloClient({ 
    token: event.cookies.get('token') 
  });

  return resolve(event);
};
```

Update your TypeScript definitions:

```ts
// src/app.d.ts
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';

declare global {
  namespace App {
    interface Locals {
      apollo: ApolloClient<NormalizedCacheObject>;
    }
  }
}

export {};
```

Now use the shared client in your load functions:

```ts
// src/routes/posts/+page.server.ts
import type { PageServerLoad } from './$types';
import { GET_POSTS } from '$lib/queries';

export const load: PageServerLoad = async ({ locals }) => {
  const { apollo } = locals;
  const result = await apollo.query({
    query: GET_POSTS
  });

  return {
    posts: result.data
  };
};
```


## FAQ

<details>
  <summary>Why use `Query` when data is already available?</summary>
  
  Using Apollo Runes, you can fetch data again, subscribe to updates, or load more items for pagination. The reason to use a query even when data exists is that it expands your options for interacting with that resource.
</details>
