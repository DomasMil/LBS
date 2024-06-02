import type { LayoutServerLoad } from './$types';
import { parse } from 'cookie';

export const load = ({ request }) => {
    const cookies = request.headers.get('cookie');
    const { username, role, name, user_id, company_id } = parse(cookies || '');
    console.log("----------cookies----------------------",cookies);
    return {
        name: name,
        username: username,
        role: role,
        user_id: user_id,
        company_id: company_id
    };
};