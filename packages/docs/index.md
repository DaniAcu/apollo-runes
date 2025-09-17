---
layout: home

hero:
  name: "Apollo Runes"
  text: "Apollo Client for Svelte 5"
  tagline: "Reactive GraphQL with runes support"
  image:
    src: /logo.svg
    alt: Apollo Runes
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/DaniAcu/apollo-runes

features:
  - icon: ✨
    title: Automatic Updates
    details: Don't think about updating the UI or refetching the queries!
  - icon: 🚀
    title: Powered by Svelte 5 Runes
    details: Built natively with Svelte 5’s runes API for seamless integration.
  - icon: 🎯
    title: TypeScript First
    details: Full TypeScript support with type safety, autocompletion, and a smooth developer experience.

---

## Quick Start

Get started with Apollo Runes in minutes:

```bash
pnpm add apollo-runes @apollo/client graphql rxjs
# or
npm i apollo-runes @apollo/client graphql rxjs
# or
yarn add apollo-runes @apollo/client graphql rxjs
```

> Same as [here](https://www.apollographql.com/docs/react/get-started#step-2-install-dependencies) for React

## Usage

```ts
  import { Query } from 'apollo-runes';
  import { gql} from '@apollo/client';


  const GET_USERS = gql`
    query GetUsers {
      users {
        id
        name
        email
      }
    }
  `;

  const { data, loading, error } = new Query(GET_USERS);
```
