---
title: Query
---

## Basic query

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

## Refetch and fetchMore

```svelte
<button on:click={() => posts.refetch({ limit: 20 })}>Refetch 20</button>
<button on:click={() => posts.fetchMore({ variables: { limit: 10 } })}>Load more</button>
```

## Subscribe to more

```ts
posts.subscribeToMore({
  document: NEW_POST_SUB,
  updateQuery: (prev, { subscriptionData }) => {
    if (!subscriptionData?.data) return prev;
    return { ...prev, posts: [subscriptionData.data.newPost, ...prev.posts] };
  }
});
```

See Apollo's Query concepts and options: [Queries](https://www.apollographql.com/docs/react/core/queries/).


