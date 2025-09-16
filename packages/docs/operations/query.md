# Query

## Usage

A query runs automatically when the component is initialized. It fetches data immediately using the provided variables and updates reactively when the data changes.

```svelte
<script lang="ts">
  import { Query } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const GET_POSTS = gql`
    query Posts($limit: Int) {
      posts(limit: $limit) { id title }
    }
  `;

  const posts = new Query(GET_POSTS, { variables: { limit: 10 } });
</script>

{#if posts.loading}
  Loading...
{:else if posts.error}
  Error: {posts.error.message}
{:else}
  {#each posts.data?.posts ?? [] as p}
    {p.title}
  {/each}
{/if}
```

## Using as lazy query

A lazy query does not execute automatically. You can trigger it manually, for example in response to a user action like a button click. This is useful for fetching data on-demand.

```svelte
<script lang="ts">
  import { Query } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const GET_POSTS = gql`
    query Posts($limit: Int) {
      posts(limit: $limit) { id title }
    }
  `;

  const posts = new Query(GET_POSTS, { variables: { limit: 10 }, lazy: true });

</script>

<button onclick={() => post.execute()}>Load posts</button>

{#if posts.loading}
  Loading...
{:else if posts.error}
  Error: {posts.error.message}
{:else}
  {#each posts.data?.posts ?? [] as p}
    {p.title}
  {/each}
{/if}
```

## Query with reactive variables
Queries can be reactive to other runes or state using `$derived`. Whenever a dependent state changes, the query re-executes or returns cached data automatically.

```ts
  let id = $state('');
  const user = $derived(new Query(USER_BY_ID, { variables: { id } }));
```


This API is highly based on React implementation, take a look here to find all the capabilities: [Queries](https://www.apollographql.com/docs/react/core/queries/).


