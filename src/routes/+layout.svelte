<script lang="ts">
	import './../global.css'
	import { page } from '$app/stores';
	import type { LayoutServerData } from './$types';
	import { onNavigate } from '$app/navigation';



	let isSideMenuOpen: boolean = true;
	let isLstDropdownOpen = false;
	let isLoginPage = true;

	$: {
        isLoginPage = $page.url.href.includes('/login');
    }

	onNavigate((navigation) => {
		if (!(document as any).startViewTransition) return;

		return new Promise((resolve) => {
			(document as any).startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
	
	function toggleSideMenu() {
        isSideMenuOpen = !isSideMenuOpen;
    }

	function toggleLstDropdown() {
	isLstDropdownOpen = !isLstDropdownOpen;
	}	

	export let data: LayoutServerData;
</script>

<header>
	<nav class="navbar is-primary px-4" style="aria-label: main navigation">
		<div class="navbar-brand pr-4">
			<span class="is-size-3 has-text-weight-semibold"></span>
		</div>
		<div class="navbar-menu">
		</div>

		<div class="navbar-end">
			<div class="navbar-item">
				<div class="buttons has-icons-left" style="margin-bottom: -0.5rem; margin-right: 1%;">
					<div class="button-container" style="display: flex; align-items: center;">
						{#if !isLoginPage}
						<a href="/profile" class="button is-primary" style="display: flex; align-items: center; justify-content: center; gap: 8px;" data-sveltekit-preload-data="off" data-sveltekit-reload>
							<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="height: 20px;">
								<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"></path>
							</svg>
							Profilis
						</a>
						{/if}

					</div>
				</div>	
				<div class="buttons">
					{#if data?.username}
						<a
							href="/logout"
							class="button is-primary"
							data-sveltekit-preload-data="off"
							data-sveltekit-reload>Labas&nbsp;<b>{data.username.toUpperCase()}</b>! Atsijungti čia</a
						>
					{:else}
						<a href="/login" class="button is-primary">Prisijungti</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>
</header>
<div class="columns">
	{#if !isLoginPage}
    <aside class="column is-2" style={isSideMenuOpen ? "display: block;" : "display: none;"}>
        <div class="menu">
            <ul class="menu-list">
				<li>
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a href="#" on:click={toggleLstDropdown}>Betonas ir gelžbetonis</a>
					<ul style={isLstDropdownOpen ? "display: block;" : "display: none;"}>
						<li><a href="/cubestrenghttest">Kubelinio stiprio bandymai</a></li>
						{#if data?.role === 'admin' || data?.role === 'employee'}
						<li><a href="/addcubestrenghttest">Sukurti naują kubelinio stiprio bandymą</a></li>
						{/if}
						
					</ul>
				</li>
				<li><a href="/users">Vartotojai</a></li>
				{#if data?.role === 'admin' || data?.role === 'employee'}
				<li><a href="/companies">Įmonės</a></li>
				{/if}
            </ul>
        </div>
    </aside>
	{/if}

    <main class="column" style={isSideMenuOpen ? "margin-left: -0.5rem;" : "margin-left: 0;"}>
		{#if !isLoginPage && !isSideMenuOpen}
		<button class="button is-info" on:click={toggleSideMenu}>→</button>
		{:else if !isLoginPage && isSideMenuOpen}
		<button class="button is-info" on:click={toggleSideMenu}>←</button>
		{/if}

        <slot />
    </main>
</div>

<style>
	.navbar-item {
		display: flex;
		align-items: center;
	}
	::-webkit-scrollbar-track {
		background: #f1f1f1; 
	}

	::-webkit-scrollbar-thumb {
		background: #00ff00;
		border-radius: 10px;
	}

	::-webkit-scrollbar {
		width: 5px;
		height: 5px; 
	}

	::-webkit-scrollbar-thumb:hover {
		background: #009900; 
	}

		.columns {
        margin-top: -0.62rem;

    }
	
    .menu {
        background-color: #f5f5f5; 
        height: 100vh; 
        border-right: 1px solid #ccc;
    }

    .menu-list {
        padding: 1rem;
        list-style-type: none;
    }

    .menu-list li {
        margin-bottom: 0.5rem;
    }

    .menu-list li a {
        color: #333; 
        text-decoration: none;
    }

    .menu-list li a:hover {
        color: #007bff; 
    }
	
</style>

