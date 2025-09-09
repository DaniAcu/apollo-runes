<script lang="ts">
	import { gql } from '@apollo/client/core';
	import { Subscription } from '$lib/operations/subscription/Subscription.js';

	// Snowtooth lift status change subscription
	// NOTE: This requires WebSocket support. For demo purposes, we'll show the structure
	// but the subscription won't work without a WebSocket link configured.
	const LIFT_STATUS_CHANGE = gql`
		subscription LiftStatusChange {
			liftStatusChange {
				id
				name
				status
			}
		}
	`;

	type LiftStatusData = { liftStatusChange: { id: string; name: string; status: string } };

	const sub = new Subscription<LiftStatusData>(LIFT_STATUS_CHANGE, {
		ignoreResults: false,
		onError: (e) => console.error('Subscription error:', e),
		onData: (data) => console.log('Lift status changed:', data)
	});

	function restart() {
		sub.restart();
	}
</script>

<div class="subscription-example">
	<h3>Snowtooth Lift Status Subscription</h3>
	
	<div class="status">
		<p><strong>Subscription Status:</strong></p>
		<ul>
			<li>Loading: {sub.loading}</li>
			<li>Error: {sub.error?.message || 'None'}</li>
		</ul>
	</div>

	{#if sub.loading}
		<p class="waiting">⏳ Waiting for lift status changes...</p>
	{/if}
	
	{#if sub.error}
		<p class="error">❌ Error: {String(sub.error)}</p>
		<p class="note">Note: This requires WebSocket support. The Snowtooth API supports subscriptions but needs a WebSocket link configured.</p>
	{/if}
	
	{#if sub.data}
		<div class="result">
			<p><strong>Latest Lift Status Change:</strong></p>
			{#if sub.data.liftStatusChange}
				<div class="lift-info">
					<h4>{sub.data.liftStatusChange?.name}</h4>
					<p><strong>Status:</strong> {sub.data.liftStatusChange?.status}</p>
					<p><strong>ID:</strong> {sub.data.liftStatusChange?.id}</p>
				</div>
			{/if}
		</div>
	{:else}
		<p class="no-data">No lift status changes received yet.</p>
	{/if}
	
	<button on:click={restart}>Restart Subscription</button>
</div>

<style>
	.subscription-example {
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		margin: 1rem 0;
		max-width: 600px;
	}
	
	.status {
		background: #f8f9fa;
		padding: 0.5rem;
		border-radius: 4px;
		margin: 1rem 0;
	}
	
	.waiting {
		color: #007bff;
		font-style: italic;
	}
	
	.error {
		color: #dc3545;
		font-weight: bold;
	}
	
	.note {
		color: #6c757d;
		font-size: 0.9em;
		margin-top: 0.5rem;
	}
	
	.no-data {
		color: #6c757d;
		font-style: italic;
	}
	
	.result {
		background: #d4edda;
		padding: 1rem;
		border-radius: 4px;
		margin: 1rem 0;
	}
	
	.lift-info {
		background: white;
		padding: 1rem;
		border-radius: 4px;
		margin-top: 0.5rem;
	}
	
	button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 1rem;
	}
	
	button:hover {
		background: #0056b3;
	}
</style>
