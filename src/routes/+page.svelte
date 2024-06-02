<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	if (typeof window !== 'undefined') {
		if(!data.loggedIn){
			goto('/login');
		}else if(data.loggedIn ){
			goto('/users');
		}
		else{
			goto('/');
		}
	}

</script>


  <style>
  
  </style>