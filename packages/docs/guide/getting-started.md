---
title: Quick Start
---

## Set up Apollo Client

```ts
// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://example.com/graphql' }),
  cache: new InMemoryCache()
});
```

## Provide the client

```svelte
<script lang="ts">
  import { ApolloProvider } from 'apollo-runes';
  import { client } from '$lib/apollo';
</script>

<ApolloProvider {client}>
  {@render children?.()}
</ApolloProvider>
```

## First query

```svelte
<script lang="ts">
  import { Query } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const GET_USERS = gql`
    query GetUsers { users { id name } }
  `;

  const users = new Query(GET_USERS);
</script>

{#if users.loading}
  Loading...
{:else if users.error}
  Error: {users.error.message}
{:else}
  {#each users.data?.users ?? [] as user}
    {user.name}
  {/each}
{/if}
```
TODO: Add a to more information use


