import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load = (({ cookies }) => {
    cookies.delete('username');
	cookies.delete('role');
	cookies.delete('user_id');
	cookies.delete('loggedIn');
	cookies.delete('company_id');
	throw redirect(303, '/');
}) satisfies PageServerLoad;
