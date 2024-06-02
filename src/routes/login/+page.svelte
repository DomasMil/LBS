<script lang="ts">
	import type { ActionData } from './$types';

	let username = 'DomasMil';
	let password = 'DomasMil';

	export let form: ActionData;
	
</script>

<div class="container" style="max-width: 55ch;">
	<h1 class="is-size-3 has-text-weight-semibold my-4">Prisijungimas</h1>
	<form method="post" action="?/login">
		<input
			class="input my-2"
			type="text"
			placeholder="Vartotojo vardas"
			name="username"
			value={username}
			required
		/>
		<input
			class="input my-2"
			type="password"
			placeholder="Slaptažodis"
			name="password"
			value={password}
			required
		/>
		{#if form?.errorMessage}
			<div class="has-text-danger my-2">{form.errorMessage}</div>
		{/if}
		<button class="button is-primary mt-4 is-fullwidth" type="submit" formaction="?/login"
			>Prisijungti</button
		>
		<hr />
	</form>
</div>
