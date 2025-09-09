<script lang="ts">
	import { browser } from "$app/environment";
	import ExampleContainer from "../examples/ExampleContainer.svelte";	
</script>

	<ExampleContainer>
		<slot />
	</ExampleContainer>
