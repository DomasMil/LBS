<script lang="ts">
	import type { PageData } from '../addconcretecubestrenghttest/$types';
    import type { MyUserType } from '$lib/server/db/tables/user/UserType';
	import type { CompanyType } from '$lib/server/db/tables/company/CompanyType';
	import type { ConstructionSiteType } from '$lib/server/db/tables/constructionsite/ConstructionSiteType';
	import { onMount } from 'svelte';

    // Variable to store selected date and time
    let selectedDateTime = '';
    let showSuccess = false;

    let users: MyUserType[];
    let companies: CompanyType[];
    let constructionSites: ConstructionSiteType[]
    let selectedCompanyId: number; // Variable to store the ID of the selected company
    let selectedConstructionSiteId: number; // Variable to store the ID of the selected construction site
    let selectedTestType: string; // Variable to store the selected test type
    let numberOfSamples = 0; // Variable to store the number of samples
    export let data: PageData;
	//export let form: ActionData;
  
    onMount(() => {
      const params = new URLSearchParams(window.location.search);
      showSuccess = params.has('success');
    });

    $: if (users == null) {
        users = data.users;
    }

    $: if (companies == null) {
        companies = data.companies;
    }

    $: if (constructionSites == null) {
        constructionSites = data.constructionSites;
    }


    const selectMap = new Map([
        ["Tipo bandymas", 3],
        ["Periodinis", 1]
    ]);

</script>

{#if showSuccess}
  <div class="notification is-success">
    Bandymas sėkmingai išsaugotas!
  </div>
  <script>
    setTimeout(() => {
        window.location.href = '/addcubestrenghttest';
    }, 5000);
  </script>
{/if}

<div class="px-4 mt-5">
    <div class="card">
        <header class="card-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <p class="title py-4 px-4">
                    “LST EN 12390-3” kubelio stiprio nustatymo tyrimas.
                </p>
            </div>
        </header>
        <div class="card-content">
            <div class="content">
                <form method="post" action="?/addStrengthTest">
                    <div class="container" style="max-width: 50%;">
                        <div class="select">
                            <label for="name">Užsakovas:</label>
                            <select bind:value={selectedCompanyId} name="clientCompany" required>
                                {#each companies as company}
                                    <option value={company.Id}>{company.Name}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="select">
                            <label for="name">Užsakovo statybos objektas:</label>
                            <select bind:value={selectedConstructionSiteId} name="companyConstructionSite" required>
                                {#each constructionSites as constructionSite}
                                    {#if constructionSite.CompanyId === selectedCompanyId}
                                        <option value={constructionSite.Id}>{`${constructionSite.Name}, ${constructionSite.Address}`}</option>
                                    {/if}
                                {/each}
                            </select>
                        </div>
                        <div class="date">
                            <label for="receivedDate">Bandinių gavimo/pristatymo data:</label>
                            <input type="date" name="receivedDate" required>
                        </div>
                        <div class="select">
                            <label for="name">Bandinius pristatė:</label>
                            <select name="deliveredBy">
                                    <option value="Užsakovas">{"Užsakovas"}</option>
                                    <option value="Užsakovo įgaliotas atstovas">{"Užsakovo įgaliotas atstovas"}</option>
                                    <option value="Vykdytojas">{"Vykdytojas"}</option>
                            </select>
                        </div>
                        <div>
                            <label for="name">Bandinių pristatymo komentaras:</label>
                            <textarea class="textarea" name="sampleReceivedComment" value="bandiniai atvežti tinkamai supakuoti, apsaugoto nuo drėgmės išgaravimo, bandinių geometrija ir matmenys vizualiai atitinka reikalavimus."></textarea>
                        </div>
                        <div class="input-container">
                            <label for="sampleCount">Pristatytų bandinių kiekis:</label>
                            <input
                                id="sampleCount"
                                class="input my-2"
                                type="number"
                                min="1"
                                name="sampleCount"
                                required
                                
                            />
                        </div>
                        <div class="select">
                            <label for="name">Bandymo tipas: </label>
                            <select  id="testTypeId" bind:value={selectedTestType} name="testType">
                                <option value="Tipo bandymas">{"Tipo bandymas"}</option>
                                <option value="Periodinis">{"Periodinis"}</option>
                            </select>
                        </div>
                        <div class="input-container">
                            <label for="name">Imties dydis:</label>
                            <input     
                                id="acceptedSampleCountInput"
                                class="input my-2"
                                type="number"
                                name="acceptedSampleCount" 
                                value={selectMap.get(selectedTestType)}
                                readonly
                                required
                                
                            />
                        </div>
                        <div class="input-container">
                            <label for="name">neatiktinių kubelių kiekis:</label>
                            <input
                                id="name"
                                class="input my-2"
                                type="number"
                                min="0"
                                max={selectMap.get(selectedTestType)}
                                name="rejectedSampleCount"
                                required
                            />
                        </div>
                        <div class="select">
                            <label for="name">Betono tipas:</label>
                            <select name="concreteType">
                                <option value="Lengvasis">{"Lengvasis"}</option>
                                <option value="Sunkusis arba normalusis">{"Sunkusis arba normalusis"}</option>
                            </select>
                        </div>
                        <div class="date">
                                <label for="testDate">Bandymo data:</label>
                                <input type="date" name="testExecutionDate" required>
                        </div>
                        <div class="input-container">
                            <label for="name">Bandė:</label>
                            <input
                                id="name"
                                class="input my-2"
                                type="text"
                                name="displayOnnyTestExecutorId"
                                value={data.name}
                                required
                                readonly
                            />
                        </div>
                        <div class="input-container">
                            <input
                                id="name"
                                class="input my-2"
                                type="hidden"
                                name="testExecutorId"
                                value={data.user_id}
                                required
                                readonly
                            />
                        </div>
                        <div class="input-container">
                            <input
                                id="name"
                                class="input my-2"
                                type="hidden"
                                name="testExecutorCompanyId"
                                value={data.company_id}
                                required
                                readonly
                            />
                        </div>
                    </div>
                    <div class="container" style="max-width: 80%;">
                        <table class="table is-fullwidth">
                            <thead>
                                <tr>
                                    <th>Bandino NR.</th>
                                    <th class="center-text">Bandinio Matmenys, mm</th>
                                    <th>Ardančioji jėga F, kN</th>
                                    <!-- <th>Stipris gniuždant fc, MPa</th> -->
                                    <th>Pastabos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each [...Array(selectMap.get(selectedTestType)).keys()] as index}
                                    <tr>
                                        <td>
                                            <input type="text" name={`cubeSample-${index}`} value={index+1} disabled class="input"  />
                                        </td>
                                        <td>
                                            <div class="field is-flex">
                                                <div>
                                                    <label class="label">Skerspjūvio</label>
                                                    {#each [1, 2, 3, 4, 5, 6] as subIndex}
                                                        <input type="number" min=0 step=0.001 name={`crossSection-a-${index}-${subIndex}`} value="{150}" class="input crossSection-input"  />
                                                    {/each}
                                                </div>
                                                <div>
                                                    <label class="label">Aukščio</label>
                                                    {#each [1, 2, 3, 4, 5, 6] as subIndex}
                                                        <input type="number" min=0 step=0.001 name={`crossSection-b-${index}-${subIndex}`} value="{150}" class="input crossSection-input"  />
                                                    {/each}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <input type="number" min=0 step=0.001 name={`destructivePower-${index}`} value="{550}" class="input"  />
                                        </td>

                                            <input type="hidden" min=0 step=0.001 name={`crushingStrength-${index}`} value="{(index+2*4)/8*25}" class="input"  />

                                        <td>
                                            <textarea name={`Comment-${index}`}  class="textarea" ></textarea>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <button class="button is-primary mt-4 is-fullwidth" type="submit" formaction="?/addStrengthTest"
                    >Pridėti</button
                >
                </form>
            </div>
        </div>
    </div>
</div>





<style>
.input-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.crossSection-input {
    display: inline-block;
    width: calc(50% - 5px); 
    margin-right: 10px;
    max-width: 50%;
    min-width: 100px;
}

.input-container label {
    width: 200px; 
    margin-right: 10px;
    white-space: nowrap; 
}

.select, .date {
    display: flex;
    align-items: center;
    margin-bottom: 10px; 
}

.select label {
    width: 200px; 
    margin-right: 10px;
    white-space: nowrap; 
}

.select select {
    width: calc(100% - 10px); 
    padding: 8px;
    font-size: 1em;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
}


.is-flex > div:not(:last-child) {
    margin-right: auto; 
    
}

.field.is-flex {
        justify-content: space-between;
    }

.center-text {
    text-align: center;
}

</style>