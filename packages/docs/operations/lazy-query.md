---
title: LazyQuery
---

`LazyQuery` defers execution until you call `execute`.

```svelte
<script lang="ts">
  import { LazyQuery } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const SEARCH = gql`query Search($q: String!) { search(q: $q) { id title } }`;
  const search = $derived(new LazyQuery(SEARCH));

  let term = '';

  async function run() {
    await search.execute({ variables: { q: term } });
  }
</script>

<input bind:value={term} placeholder="Search" />
<button on:click={run} disabled={search.loading}>Search</button>

{#if search.loading} Loading... {/if}
{#if search.error} Error: {search.error.message} {/if}
{#each search.data?.search ?? [] as r}
  {r.title}
{/each}
```

`execute` returns a promise of the first result or error. All `Query` APIs (refetch, fetchMore, updateQuery, subscribeToMore) are available after execution.

See also similar patterns in Vue Apollo composables: [Vue Apollo Guide](https://apollo.vuejs.org/guide-composable/).


