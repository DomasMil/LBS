<script lang="ts">
    import type { PageData } from './$types';
    import type { CompanyType } from '$lib/server/db/tables/company/CompanyType';
    import type { ConstructionSiteType } from '$lib/server/db/tables/constructionsite/ConstructionSiteType';
    import { onMount } from 'svelte';

    export let data: PageData;

    let comapanies: CompanyType[];
    let constructionSites: ConstructionSiteType[];
    let currentPagecomapanies: CompanyType[];

    let currentPage = 1;
    const itemsPerPage = 3;
    let isModalOpen = false;
    let isConstructionSiteModalOpen = false;
    let isNewEntry = true;
    let selectedCompany: CompanyType | null = null;
    let showAddSuccess = false;
    let showAddFail = false;
    let showUpdateSuccess = false;
    let showUpdateFail = false;
    let showSiteAddSuccess = false;

    onMount(() => {
      const params = new URLSearchParams(window.location.search);
      showAddSuccess = params.has('addsuccess');
      showAddFail = params.has('addfailed');
      showUpdateSuccess = params.has('updatesuccess');
      showUpdateFail = params.has('updatefailed');
      showSiteAddSuccess = params.has('siteaddsuccess');
    });

    $: if (comapanies == null) {
        comapanies = data.companies;
        constructionSites = data.constructionSites;
        console.log(comapanies);
    }

    $: {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        currentPagecomapanies = comapanies.slice(startIndex, endIndex);
    }

    function nextPage() {
        if (currentPage < Math.ceil(comapanies.length / itemsPerPage)) {
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
        isNewEntry = true;
    }   

    function closeConstructionSiteModal() {
        isConstructionSiteModalOpen = false;
        isNewEntry = true;
    }   

</script>

{#if showAddSuccess}
  <div class="notification is-success">
    Įmonė sėkmingai pridėta!
  </div>
  <script>
    setTimeout(() => {
        window.location.href = '/companies';
    }, 5000);
  </script>
{/if}

{#if showAddFail}
    <div class="notification is-danger">
        Įmonės pridėti nepavyko!
    </div>
    <script>
        setTimeout(() => {
            window.location.href = '/companies';
        }, 5000);
    </script>
{/if}

{#if showUpdateSuccess}
  <div class="notification is-success">
    Įmonė sėkmingai atnaujinta!
  </div>
  <script>
    setTimeout(() => {
        window.location.href = '/companies';
    }, 5000);
  </script>
{/if}

{#if showUpdateFail}
    <div class="notification is-danger">
        Įmonės atnaujinti nepavyko!
    </div>
    <script>
        setTimeout(() => {
            window.location.href = '/companies';
        }, 5000);
    </script>
{/if}

{#if showSiteAddSuccess}
  <div class="notification is-success">
    Statybų objektas pridėtas!
  </div>
  <script>
    setTimeout(() => {
        window.location.href = '/companies';
    }, 5000);
  </script>
{/if}

<style>
    .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        grid-gap: 20px;
    }
</style>

<div class="px-4 mt-5">
    <div class="card">
        <header class="card-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <p class="title py-4 px-4">
                    Įmonės
                </p>
                <button class="button is-primary mr-4" style="margin-top: 20px;" on:click={() => {
                    isModalOpen = true;
                    selectedCompany = null;
                    isNewEntry = true;
                }}>Pridėti Įmonę</button>
            </div>
        </header>

        <div class="card-content">
            <div class="content grid-container">
                {#each currentPagecomapanies as company}
                    {#if company.Id != null && (data.role == 'admin' || data.role == 'employee')}
                        <div class="card">
                            <div class="card-content">
                                <button type="button" class="button is-small is-info" on:click={() => {
                                    selectedCompany = company;
                                    isModalOpen = true;
                                    isNewEntry = false;
                                }}>Redaguoti įmonę</button>
                                <div class="content">
                                    <p><b>Pavadinimas:</b> {company.Name}</p>
                                    <p><b>Adresas:</b> {company.Address}</p>
                                    <p><b>Įmonės kodas:</b> {company.CompanyCode}</p>
                                    <p><b>Įmonės Statybų objektai:</b>
                                    <button type="button" class="button is-small is-info" on:click={() => {
                                        selectedCompany = company;
                                        isConstructionSiteModalOpen = true;
                                        isNewEntry = true;
                                    }}>Pridėti Statybos objektą</button>
                                    </p>
                                    {#each constructionSites as constructionSite}
                                        {#if constructionSite.CompanyId == company.Id}
                                            <p>{constructionSite.Name}, {constructionSite.Address}</p>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/if}
                {/each}
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
            <h2><b>{isNewEntry ? 'Naujos įmonės forma' : 'įmonės redagavimas'}</b></h2>
            <hr>
            <div style="margin-top:2%;">
                <form method="post" action="{isNewEntry ? '?/addcompany' : '?/updatecompany'}">
                    <input type="hidden" name="id" value={selectedCompany?.Id ? selectedCompany.Id : ''} />
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label>Pavadinimas</label>
                    <input
                        class="input my-2"
                        type="text"
                        value="{selectedCompany?.Name ? selectedCompany.Name : ''}"
                        name="name"
                        required
                    />
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label>Adresas</label>   
                    <input
                        class="input my-2"
                        type="text"
                        value="{selectedCompany?.Address  ? selectedCompany.Address : ''}"
                        name="address"
                        required
                    />
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label>Įmonės kodas</label>
                    <input
                        class="input my-2"
                        type="text"
                        value="{selectedCompany?.CompanyCode ? selectedCompany.CompanyCode : ''}"
                        name="companyCode"
                        required
                    />
                    <button class="button is-primary mt-4 is-fullwidth" type="submit" formaction="{isNewEntry ? '?/addcompany' : '?/updatecompany'}"
                    >{isNewEntry ? 'Pridėti' : 'Atnaujinti'}</button>
                </form>
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close" on:click={closeModal}></button>
    </div>
{/if}

{#if isConstructionSiteModalOpen}
    <div class="modal is-active">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modal-background" on:click={closeConstructionSiteModal}></div>
        <div class="modal-content" style="background-color: white; font-size:large; padding:3%;">
            <h2><b>{isNewEntry ? 'Naujo Statybos objekto forma' : 'Statybų objekto redagavimas'}</b></h2>
            <hr>
            <div style="margin-top:2%;">
                <form method="post" action="{isNewEntry ? '?/addconstructionsite' : '?/updateconstructionsite'}">
                    <input type="hidden" name="id" value={selectedCompany?.Id ? selectedCompany.Id : ''} />
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label>Pavadinimas</label>
                    <input
                        class="input my-2"
                        type="text"
                        
                        name="name"
                        required
                    />
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label>Adresas</label>   
                    <input
                        class="input my-2"
                        type="text"
                        
                        name="address"
                        required
                    />
                    <button class="button is-primary mt-4 is-fullwidth" type="submit" formaction="{isNewEntry ? '?/addconstructionsite' : '?/updateconstructionsite'}"
                    >{isNewEntry ? 'Pridėti' : 'Atnaujinti'}</button>
                </form>
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close" on:click={closeConstructionSiteModal}></button>
    </div>
{/if}

<div class="pagination" role="navigation" aria-label="pagination">
    <button class="pagination-previous" disabled={currentPage === 1} on:click={prevPage}>Previous</button>
    <button class="pagination-next" disabled={currentPage === Math.ceil(comapanies.length / itemsPerPage)} on:click={nextPage}>Next page</button>
    <ul class="pagination-list">
        {#each Array.from({ length: Math.ceil(comapanies.length / itemsPerPage) }) as _, i}
            <li>
<button class="pagination-link" aria-label="Goto page {i + 1}" aria-current={currentPage === (i + 1)} disabled={currentPage === (i + 1)} on:click={() => { currentPage = i + 1; }}>{i + 1}</button>
            </li>
        {/each}
    </ul>
</div>