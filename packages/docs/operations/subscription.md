# Subscription

## Usage

```svelte
<script lang="ts">
  import { Subscription } from 'apollo-runes';
  import { gql } from '@apollo/client';

  const NEW_POSTS = gql`subscription { newPost { id title } }`;
  const sub = new Subscription(NEW_POSTS, { onData: (d) => console.log('new', d) });
</script>

{#if sub.loading} Connecting... {/if}
{#if sub.error} Error: {sub.error.message} {/if}
{#if sub.data}
  Latest: {sub.data.newPost.title}
{/if}
```

## Controlling lifecycle

```ts
sub.stop();
sub.restart();
sub.execute({ variables: { /* ... */ } });
```

Ensure your client is configured for WebSocket subscriptions (e.g., `graphql-ws`). See Apollo docs: [Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/).


