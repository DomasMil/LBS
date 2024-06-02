import { parse } from 'cookie';

export const load = ({ request }) => {
    const cookies = request.headers.get('cookie');
    const { loggedIn, role, } = parse(cookies || '');

    return {
        loggedIn: !!loggedIn,
        role: role
    };
};
