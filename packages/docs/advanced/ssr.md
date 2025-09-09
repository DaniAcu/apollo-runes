---
title: SSR
---

## Overview

For SSR, create the Apollo Client per request on the server, run needed operations, extract cache, and rehydrate on the client.

Workflow mirrors Apollo's SSR guidance: [SSR](https://www.apollographql.com/docs/react/performance/server-side-rendering/).

## Server

```ts
// pseudo-code for your server framework
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export function createServerClient(fetchFn: typeof fetch) {
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({ uri: 'https://example.com/graphql', fetch: fetchFn }),
    cache: new InMemoryCache()
  });
}
```

Optionally prefetch queries and serialize the cache to the HTML payload.

## Client rehydrate

```ts
// browser entry
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://example.com/graphql' }),
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__)
});
```

`apollo-runes` operations work the same in SSR; ensure you avoid running subscriptions on the server.


