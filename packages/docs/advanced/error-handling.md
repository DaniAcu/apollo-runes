---
title: Error Handling
---

`apollo-runes` surfaces Apollo errors directly on operation instances.

## Queries

```svelte
{#if query.error}
  <p>GraphQL error: {query.error.message}</p>
{/if}
```

## Mutations

```ts
const create = new Mutation(CREATE, {
  onError(error) { console.error(error); },
  errorPolicy: 'all'
});

try {
  await create.mutate({ input });
} catch (e) {
  // network or thrown error
}
```

## Subscriptions

```svelte
{#if sub.error}
  Error: {sub.error.message}
{/if}
```

See Apollo guidance on error policies and patterns: [Error handling](https://www.apollographql.com/docs/react/data/error-handling/).


