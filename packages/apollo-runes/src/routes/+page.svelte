<script lang="ts">
	import QueryExample from '../examples/query/Query.svelte';
	import MutationExample from '../examples/mutation/Mutation.svelte';
	import SubscriptionExample from '../examples/subscription/Subscription.svelte';
	import LazyQueryExample from '../examples/query/LazyQuery.svelte';

	const list = $state(['']);

	const more = () => {
		list.push('');
	};

	const less = () => {
		list.pop();
	};
</script>

<div class="container">
	<h1>Apollo Runes Examples</h1>
	
	<div class="controls">
		<button onclick={more}>Add Query Example</button>
		<button onclick={less}>Remove Query Example</button>
	</div>

	<div class="examples">
		<h2>Query Examples</h2>
		{#each list as item, index (index)}
			<QueryExample />
		{/each}

		<h2>LazyQuery Example</h2>

		<LazyQueryExample />



		<h2>Mutation Example</h2>
		<MutationExample />


		<h2>Subscription Example</h2>
		<SubscriptionExample /> 
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.controls {
		margin-bottom: 2rem;
	}

	.controls button {
		margin-right: 0.5rem;
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.examples {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	h1, h2 {
		color: #333;
	}

	h2 {
		border-bottom: 2px solid #007bff;
		padding-bottom: 0.5rem;
	}
</style>
