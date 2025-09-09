---
layout: home

hero:
  name: "Svelte Apollo"
  text: "Apollo Client for Svelte 5"
  tagline: "Reactive GraphQL with runes support"
  image:
    src: /logo.svg
    alt: Svelte Apollo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-username/svelte-apollo

features:
  - icon: 🚀
    title: Svelte 5 Runes
    details: Built with the latest Svelte 5 runes API for optimal performance and developer experience
  - icon: 🔄
    title: Reactive Queries
    details: Automatic reactivity with Svelte's reactivity system - no manual subscriptions needed
  - icon: ⚡
    title: Lazy Loading
    details: LazyQuery for on-demand data fetching with full TypeScript support
  - icon: 🎯
    title: TypeScript First
    details: Full TypeScript support with type safety and excellent developer experience
  - icon: 📦
    title: Tree Shakeable
    details: Optimized bundle size with tree-shaking support for minimal footprint
  - icon: 🔧
    title: Apollo Compatible
    details: Works with all Apollo Client features including caching, subscriptions, and more
---

## Quick Start

Get started with Svelte Apollo in minutes:

```bash
pnpm add svelte-apollo @apollo/client graphql
```

```svelte
<script>
  import { ApolloProvider } from 'svelte-apollo';
  import { Query } from 'svelte-apollo';
  import { gql } from '@apollo/client';
  import { ApolloClient, InMemoryCache } from '@apollo/client';

  const client = new ApolloClient({
    uri: 'https://your-graphql-endpoint.com/graphql',
    cache: new InMemoryCache()
  });

  const GET_USERS = gql`
    query GetUsers {
      users {
        id
        name
        email
      }
    }
  `;

  const query = $derived(new Query(GET_USERS));
</script>

<ApolloProvider {client}>
  <div>
    {#if query.loading}
      <p>Loading...</p>
    {:else if query.error}
      <p>Error: {query.error.message}</p>
    {:else}
      {#each query.data?.users || [] as user}
        <div>{user.name} - {user.email}</div>
      {/each}
    {/if}
  </div>
</ApolloProvider>
```

## What's New in Svelte 5

Svelte Apollo leverages Svelte 5's new runes system for better performance and developer experience:

- **`$derived`** - Reactive queries that automatically update when dependencies change
- **`$state`** - Reactive state management for query variables  
- **`$effect`** - Side effects for handling query results
- **Rune-style APIs** - `$query()`, `$mutation()`, `$lazyQuery()`, `$subscription()`

<div class="feature-highlight">
  <h3>🎨 Beautiful Design</h3>
  <p>This documentation uses a carefully crafted color palette featuring warm beiges, deep navy blues, and vibrant orange accents for an elegant and modern look.</p>
</div>