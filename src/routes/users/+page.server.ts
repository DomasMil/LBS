import type { MyUserType } from '$lib/server/db/tables/user/UserType';
import { getUsers, getUsersByCompanyId, createUser } from '$lib/server/db/tables/user/User';
import { parse } from 'cookie';
import { getCompanyNameById, getCompanyById, getCompanies } from '$lib/server/db/tables/company/Company';
import type { CompanyType } from '$lib/server/db/tables/company/CompanyType';
import { fail, redirect, type Actions} from '@sveltejs/kit';


export const load = async ({ request, depends }) => {
    depends('template:load');
    const cookies = request.headers.get('cookie');
    const { role, user_id, company_id } = parse(cookies || '');
    let users: MyUserType[];
    let companies: CompanyType[];


    console.log("---------------------------------",role);
    if (role == 'admin' || role == 'employee') {
        users = await getUsers() as MyUserType[];
        companies = await getCompanies() as CompanyType[];
    }
    else {  
        users = await getUsersByCompanyId(Number(user_id)) as MyUserType[];
        companies = await getCompanyById(Number(company_id)) as CompanyType[];
    }
    
    if (users.length > 0) {
        await Promise.all(users.map(async (user: MyUserType) => {
            try {
             let [company]: CompanyType[] = await getCompanyNameById(user.companyId) as CompanyType[];
                if (company.name) {
                    user.companyname = company.name;
                } else {
                    user.companyname = "Company not found";
                }
            } catch (error) {
                console.error(`Failed to get company by id ${user.companyId}:`, error);
                user.companyname = "Error fetching company";
            }
        }));
    }
    return {
        users,
        companies
    };
}

export const actions: Actions = {
	register: async ({ request, cookies }) => {
        const data = await request.formData();
        const name = data.get('name')?.toString();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();
        const email = data.get('email')?.toString();
        const company = data.get('company')?.toString();
        const role = data.get('role')?.toString();

        if (name && username && password && email && company && role) {
            createUser(username, password, name, email, Number(company), role);
            throw redirect(303, '/users?success');
        } else {
            return fail(400, { errorMessage: 'Missing username or password' });
        }
	}   
};