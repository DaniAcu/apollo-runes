# Apollo runes

![./docs/logo.svg](Apollo Runes)

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
