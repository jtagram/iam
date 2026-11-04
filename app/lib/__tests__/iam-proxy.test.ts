import { afterEach, describe, expect, it, vi } from 'vitest';

import { AUTH_COOKIE_NAME } from '@/app/lib/auth-cookie';

import { getAuthToken, invalidIdResponse, isValidId } from '../iam-proxy';

const cookieGet = vi.fn();

vi.mock('next/headers', () => ({
	cookies: () => Promise.resolve({ get: cookieGet }),
}));

afterEach(() => {
	vi.clearAllMocks();
});

describe('getAuthToken', () => {
	it('returns the cookie token', async () => {
		cookieGet.mockReturnValue({ value: 'tok' });

		expect(await getAuthToken()).toEqual({ token: 'tok' });
		expect(cookieGet).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
	});

	it('returns a 401 response when the cookie is missing', async () => {
		cookieGet.mockReturnValue(undefined);

		const result = await getAuthToken();

		expect(result.token).toBeUndefined();
		expect(result.unauthorized?.status).toBe(401);
		expect(await result.unauthorized?.json()).toEqual({
			ok: false,
			msg: 'No autenticado.',
			data: null,
		});
	});
});

describe('isValidId / invalidIdResponse', () => {
	it.each(['0', '7', '12345'])('accepts %j', (id) => {
		expect(isValidId(id)).toBe(true);
	});

	it.each(['', 'abc', '-1', '1.5', '1/2', '7?x=1', ' 7', '7\n', '../../1'])('rejects %j', (id) => {
		expect(isValidId(id)).toBe(false);
	});

	it('builds a 400 response', async () => {
		const res = invalidIdResponse();

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({
			ok: false,
			msg: 'El identificador de usuario es inválido.',
			data: null,
		});
	});
});
