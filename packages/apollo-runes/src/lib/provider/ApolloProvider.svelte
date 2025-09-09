<script lang="ts">
	import type { Snippet } from "svelte";
	import type { ApolloClient } from "@apollo/client";
	import { ApolloClientContext } from "./context.js";
	interface Props {
		client: ApolloClient;
		children: Snippet
	}

	const props: Props = $props();

	// Provide Apollo Client to child components
	ApolloClientContext.set(props.client);
</script>

{@render props.children?.()}
