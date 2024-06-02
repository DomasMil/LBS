<script lang="ts">
	import type { PageData } from './$types';
	import type { StrengthTestListType } from '$lib/server/db/tables/strengthtest/StrengthTestType';
    
    export let data: PageData;

    let strengthTests: StrengthTestListType[];
	let currentPageStrengthTests : StrengthTestListType[];

    let currentPage = 1;
    const itemsPerPage = 5;
 

    let isModalOpen = false;
    let selectedStrengthTest: StrengthTestListType | null = null;

async function createPDF(id: number) {
        try {
            const response = await fetch(`/api/pdf/${id}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/pdf'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Handle the binary data of the PDF
            const blob = await response.blob();
            console.log(blob);
            // Create a URL for the blob
            const blobUrl = window.URL.createObjectURL(blob);

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'default-filename.pdf'; // Default filename if none is specified
            if (contentDisposition) {
                const matches = /filename="([^"]+)"/.exec(contentDisposition);
                console.log(matches);
                if (matches && matches.length > 1) {
                    filename = matches[1]; // Extract filename if available
                }
            }

            // Create a link element to download the blob
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename; // You can specify a default filename for the download here

            // Append the link to the body, click it, and then remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Optional: Release the object URL
            window.URL.revokeObjectURL(blobUrl);

            // alert('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error creating PDF:', error);
            // alert('Failed to create PDF');
        }
    }

    $: if (strengthTests == null) {
        strengthTests = data.strengthTests;
        //console.log(users);
    }

	$: {
		const startIndex = (currentPage - 1) * itemsPerPage;
    	const endIndex = startIndex + itemsPerPage;
    	currentPageStrengthTests = strengthTests.slice(startIndex, endIndex);
    }

    function nextPage() {
        if (currentPage < Math.ceil(strengthTests.length / itemsPerPage)) {
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
</script>

<div class="px-4 mt-5">
    <div class="card">
        <header class="card-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <p class="title py-4 px-4">
                    Kubelinio stiprio bandymai
                </p>
            </div>
        </header>
        <div class="card-content">
            <div class="content">
                <table class="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>Protokolo numeris</th>
                            <th>Įmonė</th>
                            <th>Objekto adresas</th>
                            <th>Testo tipas</th>
                            <th>Atlikimo data</th>
							<th>Bandytojo vardas</th>
							<th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each currentPageStrengthTests as strengthTest}
                            <!-- {#if user.id != null && user.role != 'admin'} -->
                                <tr>
                                    <td>{strengthTest.TestProtocolNumber}</td>
                                    <td>{strengthTest.ClientCompanyId.Name}</td>
                                    <td>{strengthTest.ClientConstructionSiteId.Address}</td>
                                    <td>{strengthTest.TestType}</td>
									<td>{`${strengthTest.TestSamplesReceivedDate.getFullYear()}-${('0' + (strengthTest.TestSamplesReceivedDate.getMonth() + 1)).slice(-2)}-${('0' + strengthTest.TestSamplesReceivedDate.getDate()).slice(-2)}`}</td>
									<td>{strengthTest.TestExecutedByUserId.name}</td>
                                    <td><button
                                        type="button"
                                        class="button is-small is-info"
                                        on:click={() => {
                                            console.log('alo');
                                            createPDF(strengthTest.Id);
                                        }}
                                    >
                                        {'Atsisiųsti duomenis'}</button
                                    ></td>
                                </tr>
                            <!-- {/if} -->
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>


{#if isModalOpen && selectedStrengthTest != null}
    <div class="modal is-active">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modal-background" on:click={closeModal}></div>
        <div class="modal-content" style="background-color: white; font-size:large; padding:3%;">
            <h2><b>Visi atlikti testai</b></h2>
            <hr>
            <div style="margin-top:2%;">
                <table class="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Testo pavadinimas</th>
                            <th>Atlikimo data</th>
                            <th>Rezultatas</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close" on:click={closeModal}></button>
    </div>
{/if}

<div class="pagination" role="navigation" aria-label="pagination">
    <button class="pagination-previous" disabled={currentPage === 1} on:click={prevPage}>Previous</button>
    <button class="pagination-next" disabled={currentPage === Math.ceil(strengthTests.length / itemsPerPage)} on:click={nextPage}>Next page</button>
    <ul class="pagination-list">
        {#each Array.from({ length: Math.ceil(strengthTests.length / itemsPerPage) }) as _, i}
            <li>
<button class="pagination-link" aria-label="Goto page {i + 1}" aria-current={currentPage === (i + 1)} disabled={currentPage === (i + 1)} on:click={() => { currentPage = i + 1; }}>{i + 1}</button>
            </li>
        {/each}
    </ul>
</div>