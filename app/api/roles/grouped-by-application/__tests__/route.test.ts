import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { iamResponse } from '@/test/mocks/iam';

import { GET } from '../route';

const cookieGet = vi.fn();

vi.mock('next/headers', () => ({
	cookies: () => Promise.resolve({ get: cookieGet }),
}));

const fetchMock = vi.fn();

beforeEach(() => {
	vi.stubEnv('IAM_API_URL', 'http://iam.test');
	vi.stubGlobal('fetch', fetchMock);
	cookieGet.mockReturnValue({ value: 'tok123' });
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('GET /api/roles/grouped-by-application', () => {
	it('throws when IAM_API_URL is missing', async () => {
		vi.stubEnv('IAM_API_URL', '');

		await expect(GET()).rejects.toThrow('IAM_API_URL environment variable is required');
	});

	it('returns 401 when there is no auth cookie', async () => {
		cookieGet.mockReturnValue(undefined);

		const res = await GET();

		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ ok: false, msg: 'No autenticado.', data: null });
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('requests IAM with the bearer token and returns its response as is', async () => {
		const body = {
			ok: true,
			msg: 'Roles grouped by application retrieved successfully',
			data: [
				{
					applicationId: 1,
					applicationName: 'billing',
					applicationDescription: 'd',
					roles: [{ id: 1, name: 'admin', description: 'd' }],
				},
			],
		};
		fetchMock.mockResolvedValue(iamResponse(body));

		const res = await GET();

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith(
			'http://iam.test/roles/grouped-by-application',
			expect.objectContaining({
				method: 'GET',
				headers: { Authorization: 'Bearer tok123' },
			}),
		);
	});

	it('returns the IAM error status and body untouched', async () => {
		const body = { ok: false, msg: 'Forbidden', data: null };
		fetchMock.mockResolvedValue(iamResponse(body, 403));

		const res = await GET();

		expect(res.status).toBe(403);
		expect(await res.json()).toEqual(body);
	});

	it('does not rewrite a body that is not JSON', async () => {
		fetchMock.mockResolvedValue(
			new Response('<html>Bad Gateway</html>', {
				status: 503,
				headers: { 'Content-Type': 'text/html' },
			}),
		);

		const res = await GET();

		expect(res.status).toBe(503);
		expect(res.headers.get('Content-Type')).toBe('text/html');
		expect(await res.text()).toBe('<html>Bad Gateway</html>');
	});

	it('defaults the content type to JSON when IAM sends none', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

		const res = await GET();

		expect(res.status).toBe(500);
		expect(res.headers.get('Content-Type')).toBe('application/json');
	});
});
