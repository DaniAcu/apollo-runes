<script lang="ts">
	import { Mutation } from '$lib/operations/mutation/Mutation.js';
	import { gql } from '@apollo/client';

	// Snowtooth setLiftStatus mutation
	const SET_LIFT_STATUS = gql`
		mutation SetLiftStatus($id: ID!, $status: LiftStatus!) {
			setLiftStatus(id: $id, status: $status) {
				id
				name
				status
			}
		}
	`;

	// Create mutation instance
	const mutation = new Mutation(SET_LIFT_STATUS, {
		onCompleted: (data) => {
			console.log('Mutation completed:', data);
		},
		onError: (error) => {
			console.error('Mutation error:', error);
		}
	});

	let selectedLiftId = 'jazz-cat';
	let selectedStatus = 'HOLD';

	const liftOptions = [
		{ id: 'jazz-cat', name: 'Jazz Cat' },
		{ id: 'astra-express', name: 'Astra Express' },
		{ id: 'summit-express', name: 'Summit Express' },
		{ id: 'teton-gravity', name: 'Teton Gravity' }
	];

	const statusOptions = [
		'OPEN',
		'CLOSED', 
		'HOLD',
		'MAINTENANCE'
	];

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!selectedLiftId || !selectedStatus) return;

		try {
			const result = await mutation.mutate({ 
				id: selectedLiftId, 
				status: selectedStatus 
			});
			console.log('Mutation result:', result);
		} catch (error) {
			console.error('Failed to execute mutation:', error);
		}
	};
</script>

<div class="mutation-example">
	<h3>Snowtooth Lift Status Mutation</h3>
	
	<form on:submit={handleSubmit}>
		<div class="form-group">
			<label for="lift-select">Select Lift:</label>
			<select id="lift-select" bind:value={selectedLiftId} disabled={mutation.loading}>
				{#each liftOptions as option}
					<option value={option.id}>{option.name}</option>
				{/each}
			</select>
		</div>
		
		<div class="form-group">
			<label for="status-select">Select Status:</label>
			<select id="status-select" bind:value={selectedStatus} disabled={mutation.loading}>
				{#each statusOptions as status}
					<option value={status}>{status}</option>
				{/each}
			</select>
		</div>
		
		<button type="submit" disabled={mutation.loading}>
			{mutation.loading ? 'Updating...' : 'Update Lift Status'}
		</button>
	</form>

	<div class="status">
		<p><strong>Status:</strong></p>
		<ul>
			<li>Loading: {mutation.loading}</li>
			<li>Called: {mutation.called}</li>
			<li>Error: {mutation.error?.message || 'None'}</li>
		</ul>
	</div>

	{#if mutation.data}
		<div class="result">
			<p><strong>Last Result:</strong></p>
			<pre>{JSON.stringify(mutation.data, null, 2)}</pre>
		</div>
	{/if}

	<button on:click={() => mutation.reset()}>Reset Mutation</button>
</div>

<style>
	.mutation-example {
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		margin: 1rem 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: bold;
	}

	select {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: white;
	}

	button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.status, .result {
		margin: 1rem 0;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 4px;
	}

	pre {
		background: #f1f1f1;
		padding: 0.5rem;
		border-radius: 4px;
		overflow-x: auto;
	}
</style>

