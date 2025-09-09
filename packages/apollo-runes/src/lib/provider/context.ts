// Context key for Apollo Client
import { getContext, setContext } from 'svelte';
import type { ApolloClient } from '@apollo/client';

const APOLLO_CLIENT_KEY = Symbol('apollo-client');

export const ApolloClientContext = {
    set: (client: ApolloClient) => {
        setContext(APOLLO_CLIENT_KEY, client);
    },
    get: () => {
        return getContext(APOLLO_CLIENT_KEY) as ApolloClient;
    }
}

export default ApolloClientContext;
