import { checkUserCredentials, findUserByUsername } from '$lib/server/db/tables/user/User';

import { fail, redirect, type Actions, type Cookies } from '@sveltejs/kit';

async function performLogin(cookies: Cookies, username: string) {
    const [result] = await findUserByUsername(username);
	cookies.set('name', result.name);
    cookies.set('username', result.username);
    cookies.set('role', result.role);
    cookies.set('user_id', result.id);
    cookies.set('company_id', result.companyId);
    cookies.set('loggedIn', 'true');
}

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const password = data.get('password')?.toString();
		
		if (username && password) {
			const res = await checkUserCredentials(username, password);
			if (!res) {
				return fail(401, { errorMessage: 'Neteisingas prisijungimo vardas arba slaptažodis' });
			}
			await performLogin(cookies, username);
			throw redirect(303, '/');
		} else {
			return fail(400, { errorMessage: 'Trūksta prisijungimo vardo arba slaptažodis' });
		}
	}
};
