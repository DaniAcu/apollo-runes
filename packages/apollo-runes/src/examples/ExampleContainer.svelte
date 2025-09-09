<script lang="ts">
	import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
	import { getMainDefinition } from '@apollo/client/utilities';
	import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
	import { createClient } from 'graphql-ws';
	import { ApolloProvider } from '$lib/index.js';

	// HTTP link for queries and mutations
	const httpLink = new HttpLink({
		uri: 'https://snowtooth.moonhighway.com/', // Snowtooth GraphQL API
	});

	// WebSocket link for subscriptions
	const wsLink = new GraphQLWsLink(createClient({
		url: 'wss://snowtooth.moonhighway.com/',
	}));

	// Split link: HTTP for queries/mutations, WebSocket for subscriptions
	const splitLink = split(
		({ query }) => {
			const definition = getMainDefinition(query);
			return (
				definition.kind === 'OperationDefinition' &&
				definition.operation === 'subscription'
			);
		},
		wsLink, // WebSocket for subscriptions
		httpLink, // HTTP for queries and mutations
	);

	// Create Apollo Client instance
	const client = new ApolloClient({
		link: splitLink,
		cache: new InMemoryCache()
	});
</script>

<ApolloProvider {client}>
	<slot />
</ApolloProvider>
