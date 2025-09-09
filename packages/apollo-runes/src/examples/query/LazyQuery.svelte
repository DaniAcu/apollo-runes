<script lang="ts">
	import { gql } from '@apollo/client';
	import { LazyQuery } from '$lib/operations/query/LazyQuery.js';

	// Snowtooth trails query - this will be loaded lazily
	let GET_TRAILS = $state(`
		query GetTrails {
			allTrails {
				id
				name
				difficulty
				status
				groomed
				night
			}
		}
	`);

	const QUERY = $derived(gql(GET_TRAILS));

	// Create lazy query instance
	const lazyQuery = $derived(new LazyQuery(QUERY));

	// State for the lazy query
	let isExecuted = $state(false);
	let executionPromise: Promise<any> | null = $state(null);

	// Reactive data from lazy query
	const data = $derived(lazyQuery.data);
	const trails = $derived(data?.allTrails || []);

	// Track loading state
	const isLoading = $derived(lazyQuery.loading);
	const error = $derived(lazyQuery.error);

	// Effects to log state changes
	$effect(() => {
		console.log('LazyQuery loading:', isLoading);
	});

	$effect(() => {
		console.log('LazyQuery data:', data);
	});

	$effect(() => {
		if (error) {
			console.error('LazyQuery error:', error);
		}
	});

	// Execute the lazy query
	const executeQuery = async () => {
		if (isExecuted) {
			console.log('Query already executed, refetching...');
			await lazyQuery.refetch();
			return;
		}

		console.log('Executing lazy query...');
		isExecuted = true;
		
		try {
			executionPromise = lazyQuery.execute({
				// You can pass additional options here
				// fetchPolicy: 'cache-first',
				// errorPolicy: 'all'
			});
			
			const result = await executionPromise;
			console.log('Lazy query executed successfully:', result);
		} catch (err) {
			console.error('Failed to execute lazy query:', err);
			isExecuted = false;
		}
	};

	// Reset the query
	const resetQuery = () => {
		isExecuted = false;
		executionPromise = null;
		console.log('Query reset');
	};

	// Change the query
	const changeQuery = () => {
		GET_TRAILS = `
			query GetTrails {
				allTrails {
					id
					name
					difficulty
				}
			}
		`;
		console.log('Query changed, resetting...');
		resetQuery();
	};

	// Get difficulty color
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty?.toLowerCase()) {
			case 'green': return 'green';
			case 'blue': return 'blue';
			case 'black': return 'black';
			case 'double-black': return 'red';
			default: return 'gray';
		}
	};
</script>

<div class="container">
	<h1>Snowtooth Trails LazyQuery Example</h1>
	<p class="description">
		This example demonstrates lazy loading with LazyQuery. 
		The query won't execute until you click the "Load Trails" button.
	</p>

	<div class="controls">
		<button 
			onclick={executeQuery} 
			disabled={isLoading}
			class="primary"
		>
			{isLoading ? 'Loading...' : (isExecuted ? 'Refetch Trails' : 'Load Trails')}
		</button>
		
		<button onclick={resetQuery} disabled={!isExecuted}>
			Reset Query
		</button>
		
		<button onclick={changeQuery} disabled={isLoading}>
			Change Query
		</button>
	</div>
	
	<div class="section">
		<h2>🏔️ Trails from Snowtooth</h2>
		
		{#if !isExecuted}
			<div class="placeholder">
				<p>Click "Load Trails" to fetch trail data</p>
			</div>
		{:else if isLoading}
			<div class="loading">Loading trails...</div>
		{:else if error}
			<div class="error">Error: {error.message}</div>
		{:else if trails.length > 0}
			<div class="success">✅ Loaded {trails.length} trails</div>
			<div class="trails-grid">
				{#each trails as trail}
					<div class="trail-card">
						<h3 class="trail-name">{trail.name}</h3>
						<div class="trail-details">
							<span class="difficulty difficulty-{getDifficultyColor(trail.difficulty)}">
								{trail.difficulty}
							</span>
							<span class="status status-{trail.status?.toLowerCase()}">{trail.status}</span>
							{#if trail.groomed}
								<span class="groomed">🎿 Groomed</span>
							{/if}
							{#if trail.night}
								<span class="night">🌙 Night Skiing</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="loading">No trails found</div>
		{/if}
	</div>

	<div class="debug-section">
		<h3>Debug Info</h3>
		<div class="debug-info">
			<p><strong>Query Executed:</strong> {isExecuted}</p>
			<p><strong>Loading:</strong> {isLoading}</p>
			<p><strong>Has Data:</strong> {data ? 'Yes' : 'No'}</p>
			<p><strong>Error:</strong> {error ? error.message : 'None'}</p>
			<p><strong>Trails Count:</strong> {trails.length}</p>
		</div>
	</div>
</div>

<style>
	.container {
		padding: 1rem;
		width: 100%;
		margin: 0;
	}
	
	.description {
		color: #666;
		margin-bottom: 1.5rem;
		font-style: italic;
	}
	
	.controls {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}
	
	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}
	
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	button.primary {
		background: #007bff;
		color: white;
	}
	
	button.primary:hover:not(:disabled) {
		background: #0056b3;
	}
	
	button:not(.primary) {
		background: #6c757d;
		color: white;
	}
	
	button:not(.primary):hover:not(:disabled) {
		background: #545b62;
	}
	
	.section {
		margin: 1.5rem 0;
	}
	
	.placeholder {
		text-align: center;
		padding: 2rem;
		background: #f8f9fa;
		border: 2px dashed #dee2e6;
		border-radius: 8px;
		color: #6c757d;
	}
	
	.success {
		color: green;
		font-weight: bold;
		margin-bottom: 1rem;
	}
	
	.loading {
		color: blue;
		font-style: italic;
		text-align: center;
		padding: 1rem;
	}
	
	.error {
		color: red;
		font-weight: bold;
		background: #f8d7da;
		padding: 1rem;
		border-radius: 4px;
		border: 1px solid #f5c6cb;
	}
	
	.trails-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
		margin-top: 15px;
		width: 100%;
	}
	
	.trail-card {
		border: 1px solid #ddd;
		padding: 16px;
		border-radius: 8px;
		background: #f9f9f9;
		transition: box-shadow 0.2s ease;
	}
	
	.trail-card:hover {
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}
	
	.trail-name {
		margin: 0 0 12px 0;
		font-size: 1.2em;
		color: #333;
		font-weight: bold;
	}
	
	.trail-details {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 0.9em;
	}
	
	.difficulty {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.8em;
		font-weight: bold;
		text-transform: uppercase;
		display: inline-block;
		width: fit-content;
		color: white;
	}
	
	.difficulty-green { background: #28a745; }
	.difficulty-blue { background: #007bff; }
	.difficulty-black { background: #343a40; }
	.difficulty-red { background: #dc3545; }
	.difficulty-gray { background: #6c757d; }
	
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
	
	.groomed, .night {
		color: #666;
		font-size: 0.85em;
		font-weight: 500;
	}
	
	.debug-section {
		margin-top: 2rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		border: 1px solid #dee2e6;
	}
	
	.debug-section h3 {
		margin: 0 0 1rem 0;
		color: #495057;
		font-size: 1.1em;
	}
	
	.debug-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.5rem;
	}
	
	.debug-info p {
		margin: 0;
		font-size: 0.9em;
		color: #6c757d;
	}
</style>
