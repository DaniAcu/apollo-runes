---
title: Mutation
---

## Basic mutation

```svelte
<script lang="ts">
  import { Mutation } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const CREATE_POST = gql`
    mutation CreatePost($title: String!) { createPost(title: $title) { id title } }
  `;

  const createPost = $derived(new Mutation(CREATE_POST));
  let title = '';

  async function submit() {
    await createPost.mutate({ title });
  }
</script>

<input bind:value={title} />
<button on:click={submit} disabled={createPost.loading}>Create</button>

{#if createPost.error} Error: {createPost.error.message} {/if}
```

## Optimistic UI and cache updates

Use Apollo's `optimisticResponse`, `update`, and `refetchQueries` through options:

```ts
const createPost = new Mutation(CREATE_POST, {
  optimisticResponse: (vars) => ({ createPost: { __typename: 'Post', id: 'temp', title: vars.title } }),
  update(cache, { data }) {
    if (!data?.createPost) return;
    cache.modify({
      fields: {
        posts(existing = []) { return [data.createPost, ...existing]; }
      }
    });
  },
  refetchQueries: ['Posts']
});
```

For strategies, see Apollo docs: [Mutations](https://www.apollographql.com/docs/react/data/mutations/) and [Cache updates](https://www.apollographql.com/docs/react/caching/cache-interaction/).


