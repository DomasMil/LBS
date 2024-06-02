import { error } from '@sveltejs/kit';
import { parse } from 'cookie';
import type { CompanyType } from '$lib/server/db/tables/company/CompanyType';
import { createCompany, getCompanies, updateCompany } from '$lib/server/db/tables/company/Company';
import type { ConstructionSiteType } from '$lib/server/db/tables/constructionsite/ConstructionSiteType.js';
import { createConstructionSite, getConstructionSites } from '$lib/server/db/tables/constructionsite/ConstructionSite';
import { fail, redirect, type Actions} from '@sveltejs/kit';

export const load = async ({ request, depends }) => {
	depends('template:load');
    const cookies = request.headers.get('cookie');
    const { role } = parse(cookies || '');
	if (!role?.includes('admin') && !role?.includes('employee')) {
		throw error(404, 'Neteisėtas prisijungimas');
	}
    let companies: CompanyType[];
    let constructionSites: ConstructionSiteType[];
    companies = await getCompanies() as CompanyType[];
    constructionSites = await getConstructionSites() as ConstructionSiteType[];


    return {
        companies,
        constructionSites
    };
}

export const actions: Actions = {

	addcompany: async ({ request, cookies }) => {
        const data = await request.formData();
        const name = data.get('name')?.toString();
        const address = data.get('address')?.toString();
        const companyCode = data.get('companyCode')?.toString();
        if (name && address && companyCode) {
            createCompany(name, address, companyCode);
            throw redirect(303, '/companies?addsuccess');
        } else {
            return fail(400, { errorMessage: 'Missing information' });
        }
	},
    
    updatecompany: async ({ request, cookies }) => {
        const data = await request.formData();
        const id = Number(data.get('id'));
        const name = data.get('name')?.toString();
        const address = data.get('address')?.toString();
        const companyCode = data.get('companyCode')?.toString();
        if (id && name && address && companyCode) {
            updateCompany(id, name, address, companyCode);
            throw redirect(303, '/companies?updatesuccess');
        } else {
            return fail(400, { errorMessage: 'Missing information' });
        }
	},
    
    addconstructionsite: async ({ request, cookies }) => {
        const data = await request.formData();
        const company_id = Number(data.get('id'));
        const name = data.get('name')?.toString();
        const address = data.get('address')?.toString();
        if (name && address && company_id) {
            createConstructionSite(company_id, name, address);
            throw redirect(303, '/companies?siteaddsuccess');
        } else {
            return fail(400, { errorMessage: 'Missing information' });
        }
	}
};