<script lang="ts">
	import { gql } from '@apollo/client';
	import { Query } from '$lib/index.js';

    // Snowtooth lifts query
	let GET_LIFTS = $state(`
		query GetLifts {
			allLifts {
				id
				name
				status
				capacity
				elevationGain
			}
		}
	`);

	const QUERY = $derived(gql(GET_LIFTS));

	const query = $derived(new Query(QUERY));

	const data = $derived(query.data)
	const lifts = $derived(data?.allLifts || []);

	$effect(() => {
		console.log('loading', query.loading);
	})

    $effect(() => {
		console.log('data', query.data);
	})

	const refresh = () => {
		query.refetch();
	}

	const changeQuery = () => {
		GET_LIFTS = `
			query GetLifts {
				allLifts {
					id
					name
				}
			}
		`;

		console.log(GET_LIFTS)
	}
</script>

<div class="container">
	<h1>Snowtooth Lifts Query Example</h1>

	<button onclick={refresh}>Refresh</button>
	<button onclick={changeQuery}>Change Query</button>
	
	<div class="section">
		<h2>🎿 Lifts from Snowtooth</h2>
		
		{#if query.loading}
			<div class="loading">Loading lifts...</div>
		{:else if query.error}
			<div class="error">Error: {query.error.message}</div>
		{:else if lifts.length > 0}
			<div class="success">✅ Loaded {lifts.length} lifts</div>
			<div class="lifts-grid">
				{#each lifts as lift}
					<div class="lift-card">
						<h3 class="lift-name">{lift!.name}</h3>
						<div class="lift-details">
							<span class="status status-{lift!.status?.toLowerCase()}">{lift.status}</span>
							<span class="capacity">👥 {lift.capacity}</span>
							<span class="elevation">⛰️ {lift.elevationGain}ft</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="loading">No lifts found</div>
		{/if}
	</div>
</div>

<style>
	.container {
		padding: 1rem;
		width: 100%;
		margin: 0;
	}
	
	.section {
		margin: 1rem 0;
	}
	
	.success {
		color: green;
		font-weight: bold;
		margin-bottom: 1rem;
	}
	
	.loading {
		color: blue;
		font-style: italic;
	}
	
	.error {
		color: red;
		font-weight: bold;
	}
	
	.lifts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 12px;
		margin-top: 15px;
		width: 100%;
	}
	
	.lift-card {
		border: 1px solid #ddd;
		padding: 12px;
		border-radius: 6px;
		background: #f9f9f9;
		transition: box-shadow 0.2s ease;
	}
	
	.lift-card:hover {
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}
	
	.lift-name {
		margin: 0 0 8px 0;
		font-size: 1.1em;
		color: #333;
	}
	
	.lift-details {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.9em;
	}
	
	.status {
		padding: 2px 6px;
		border-radius: 12px;
		font-size: 0.8em;
		font-weight: bold;
		text-transform: uppercase;
		display: inline-block;
		width: fit-content;
	}
	
	.status-open {
		background: #d4edda;
		color: #155724;
	}
	
	.status-closed {
		background: #f8d7da;
		color: #721c24;
	}
	
	.status-hold {
		background: #fff3cd;
		color: #856404;
	}
	
	.status-maintenance {
		background: #d1ecf1;
		color: #0c5460;
	}
	
	.capacity, .elevation {
		color: #666;
		font-size: 0.85em;
	}
	
	button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-bottom: 1rem;
	}
	
	button:hover {
		background: #0056b3;
	}
</style>
