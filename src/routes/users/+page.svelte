<script lang="ts">
	import type { PageData } from './$types';
    import type { MyUserType } from '$lib/server/db/tables/user/UserType';
	import type { CompanyType } from '$lib/server/db/tables/company/CompanyType';

    export let data: PageData;

    let users: MyUserType[];
    let companies: CompanyType[];
	let currentPageUsers : MyUserType[];
    let showSuccess = false;
    let currentPage = 1;
    const itemsPerPage = 10;


    let isModalOpen = false;
    let selectedUser: MyUserType | null = null;
    
    onMount(() => {
      const params = new URLSearchParams(window.location.search);
      showSuccess = params.has('addsuccess');
    });

    $: if (users == null) {
        users = data.users;
        console.log(users);
        companies = data.companies;
    }

	$: {
		const startIndex = (currentPage - 1) * itemsPerPage;
    	const endIndex = startIndex + itemsPerPage;
    	currentPageUsers = users.slice(startIndex, endIndex);
    }

    function nextPage() {
        if (currentPage < Math.ceil(users.length / itemsPerPage)) {
            currentPage += 1;
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage -= 1;
        }
    }

    function closeModal() {
        isModalOpen = false;
    }

////////////////////////////////////////////

import { onMount } from 'svelte';

let success = false;

onMount(() => {
  // Check if the URL has a success query parameter
  const params = new URLSearchParams(window.location.search);
  success = params.has('success');
});

</script>

{#if success}
  <div class="notification is-success">
    Vartotojas sėkmingai pridėtas!
  </div>
  <script>
    setTimeout(() => {
        window.location.href = '/users';
    }, 3000);
  </script>
{/if}

<div class="px-4 mt-5">
    <div class="card">
        <header class="card-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <p class="title py-4 px-4">
                    Naudotojai
                </p>
            </div>
        </header>
        <div class="card-content">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                {#if data.role !== 'client' || data.role === ''}
                    <button type="button" class="button is-primary mr-4" style="margin-top: 20px" on:click={() =>{
                        isModalOpen = true;
                    }}>{"Pridėti"}</button>
                {/if}
            </div>
            <div class="content">
                <table class="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>Naudotojas</th>
                            <th>El. paštas</th>
                            <th>Prisijungimo vardas</th>
                            <th>Įmonė</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each currentPageUsers as user}
                            {#if user.id != null} <!--&& user.role != 'teacher'-->
                                <tr>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
									<td>{user.companyname}</td>
                                </tr>
                            {/if}
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>


{#if isModalOpen}
    <div class="modal is-active">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modal-background" on:click={closeModal}></div>
        <div class="modal-content" style="background-color: white; font-size:large; padding:3%;">
            <h2><b>Naujo naudotojo forma</b></h2>
            <hr>
            <div style="margin-top:2%;">
                <form method="post" action="?/register">
                    <input
                        class="input my-2"
                        type="text"
                        placeholder="Vardas Pavardė"
                        name="name"
                        required
                    />		
                    <input
                        class="input my-2"
                        type="text"
                        placeholder="Naudotojo vardas"
                        name="username"
                        required
                    />
                    <input
                        class="input my-2"
                        type="password"
                        placeholder="Slaptažodis"
                        name="password"
                        required
                    />
                    <input
                        class="input my-2"
                        type="email"
                        placeholder="El. paštas"
                        name="email"
                        required
                    />
                    <select class="input my-2" name="company" id="company" required>
                    <option value="" disabled selected>Pasirinkti Įmonę</option>
                    {#each companies as company}
                        <option value={company.Id}>{company.Name}</option>
                    {/each}
                    </select>
                    <select class="input my-2" name="role" id="roleSelect" required>
                        <option value="" disabled selected>Pasirinkti Rolę</option>
                        {#if data.role === 'admin'}
                        <option value="admin">Administratorius</option>
                        {/if}
                        {#if data.role === 'admin'}
                        <option value="employee">Darbuotojas</option>
                        {/if}
                        {#if data.role !== 'client'}
                        <option value="client">Klientas</option>
                        {/if}
                        {#if data.role !== 'client'}
                        <option value="clientadmin">Klientas administratorius</option>
                        {/if}
                    </select>
                    <button class="button is-primary mt-4 is-fullwidth" type="submit" formaction="?/register"
                    >Pridėti</button
                >
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close" on:click={closeModal}></button>
    </div>
{/if}

<div class="pagination" role="navigation" aria-label="pagination">
    <button class="pagination-previous" disabled={currentPage === 1} on:click={prevPage}>Previous</button>
    <button class="pagination-next" disabled={currentPage === Math.ceil(users.length / itemsPerPage)} on:click={nextPage}>Next page</button>
    <ul class="pagination-list">
        {#each Array.from({ length: Math.ceil(users.length / itemsPerPage) }) as _, i}
            <li>
<button class="pagination-link" aria-label="Goto page {i + 1}" aria-current={currentPage === (i + 1)} disabled={currentPage === (i + 1)} on:click={() => { currentPage = i + 1; }}>{i + 1}</button>
            </li>
        {/each}
    </ul>
</div>