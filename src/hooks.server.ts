//import { getSession } from '$lib/server/sessionStore';
import type { Handle } from '@sveltejs/kit';


export const handle = (async ({ event, resolve }) => {
	const { cookies } = event;

	const response = await resolve(event);
	return response;
}) satisfies Handle;
