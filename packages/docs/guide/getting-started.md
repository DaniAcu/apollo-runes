# Quick Start

## 1. Set up Apollo Client

Create an Apollo Client instance to connect your Svelte app to your GraphQL endpoint. The `HttpLink` specifies the GraphQL server URI, and `InMemoryCache` handles caching of query results.

```ts
// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://example.com/graphql' }),
  cache: new InMemoryCache()
});
```

## 2. Provide the client

Wrap your Svelte app with `ApolloProvider` so that any component can access the Apollo Client.

```svelte
<script lang="ts">
  import { ApolloProvider } from 'apollo-runes';
  import { client } from '$lib/apollo';
</script>

<ApolloProvider {client}>
  {@render children?.()}
</ApolloProvider>
```


## 3. First query

Use the `Query` rune to fetch data. By default, the query executes automatically when the component mounts. The `Query` object provides `loading`, `error`, and `data` states that you can use in your template.

```svelte
<script lang="ts">
  import { Query } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const GET_USERS = gql`
    query GetUsers {
      users { id name }
    }
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

## 4. Make queries reactive to other runes

Queries can be reactive to other runes or state using `$derived`. Whenever a dependent state changes, the query re-executes or returns cached data automatically.

```svelte
<script lang="ts">
  import { Query } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const USER_BY_ID = gql`
    query UserById($id: String!) {
      user(id: $id) {
        id
        name
      }
    }
  `;

  // Reactive state for the user ID
  let id = $state('');

  // Query reacts to changes in `id`
  const user = $derived(new Query(USER_BY_ID, { variables: { id } }));
</script>

<input bind:value={id} placeholder="Enter user ID" />

{#if user.loading}
  Loading...
{:else if user.error}
  Error: {user.error.message}
{:else if user.data?.user}
  {user.data.user.name}
{/if}
```

> Every time the `id` state changes, the query will automatically re-run. `user.data.user.name` is fully reactive and updates without additional code.

