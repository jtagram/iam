import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { iamResponse, jsonRequest, routeParams } from '@/test/mocks/iam';

import { GET, POST } from '../route';

const cookieGet = vi.fn();

vi.mock('next/headers', () => ({
	cookies: () => Promise.resolve({ get: cookieGet }),
}));

const fetchMock = vi.fn();

const created = { originApplicationId: 1, destinationApplicationId: 2 };

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

describe('GET /api/apps-users/[id]/connections', () => {
	it('throws when IAM_API_URL is missing', async () => {
		vi.stubEnv('IAM_API_URL', '');

		await expect(
			GET(jsonRequest('http://localhost/api/x', 'GET'), routeParams('7')),
		).rejects.toThrow('IAM_API_URL environment variable is required');
	});

	it('returns 401 when there is no auth cookie', async () => {
		cookieGet.mockReturnValue(undefined);

		const res = await GET(jsonRequest('http://localhost/api/x', 'GET'), routeParams('7'));

		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ ok: false, msg: 'No autenticado.', data: null });
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each(['abc', '1/../2', '7?x=1', '-1', '1.5', ''])(
		'returns 400 without calling IAM when the id is %j',
		async (badId) => {
			const res = await GET(jsonRequest('http://localhost/api/x', 'GET'), routeParams(badId));

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				ok: false,
				msg: 'El identificador de usuario es inválido.',
				data: null,
			});
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it('requests IAM with the bearer token and returns its response as is', async () => {
		const body = { ok: true, msg: 'Listado', data: { id: 1, connections: [{ id: 1 }] } };
		fetchMock.mockResolvedValue(iamResponse(body));

		const res = await GET(jsonRequest('http://localhost/api/x', 'GET'), routeParams('7'));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith(
			'http://iam.test/apps-users/7/connections',
			expect.objectContaining({
				method: 'GET',
				headers: { Authorization: 'Bearer tok123' },
			}),
		);
	});

	it('returns the IAM error status and body untouched', async () => {
		const body = { ok: false, msg: 'Forbidden', data: null };
		fetchMock.mockResolvedValue(iamResponse(body, 403));

		const res = await GET(jsonRequest('http://localhost/api/x', 'GET'), routeParams('7'));

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

		const res = await GET(jsonRequest('http://localhost/api/x', 'GET'), routeParams('7'));

		expect(res.status).toBe(503);
		expect(res.headers.get('Content-Type')).toBe('text/html');
		expect(await res.text()).toBe('<html>Bad Gateway</html>');
	});

	it('defaults the content type to JSON when IAM sends none', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

		const res = await GET(jsonRequest('http://localhost/api/x', 'GET'), routeParams('7'));

		expect(res.status).toBe(500);
		expect(res.headers.get('Content-Type')).toBe('application/json');
	});
});

describe('POST /api/apps-users/[id]/connections', () => {
	it('throws when IAM_API_URL is missing', async () => {
		vi.stubEnv('IAM_API_URL', '');

		await expect(
			POST(jsonRequest('http://localhost/api/x', 'POST', created), routeParams('7')),
		).rejects.toThrow('IAM_API_URL environment variable is required');
	});

	it('returns 401 when there is no auth cookie', async () => {
		cookieGet.mockReturnValue(undefined);

		const res = await POST(
			jsonRequest('http://localhost/api/x', 'POST', created),
			routeParams('7'),
		);

		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ ok: false, msg: 'No autenticado.', data: null });
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each(['abc', '1/../2', '7?x=1', '-1', '1.5', ''])(
		'returns 400 without calling IAM when the id is %j',
		async (badId) => {
			const res = await POST(
				jsonRequest('http://localhost/api/x', 'POST', created),
				routeParams(badId),
			);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				ok: false,
				msg: 'El identificador de usuario es inválido.',
				data: null,
			});
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it('forwards the request body untouched and returns the IAM response as is', async () => {
		const body = { ok: true, msg: 'Creada', data: { id: 1, connections: [{ id: 9 }] } };
		fetchMock.mockResolvedValue(iamResponse(body, 201));

		const res = await POST(
			jsonRequest('http://localhost/api/x', 'POST', { ...created, extra: 'kept' }),
			routeParams('7'),
		);

		expect(res.status).toBe(201);
		expect(await res.json()).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('http://iam.test/apps-users/7/connections', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer tok123',
			},
			body: JSON.stringify({ ...created, extra: 'kept' }),
		});
	});

	it('leaves an invalid JSON body for IAM to reject', async () => {
		const body = { ok: false, msg: 'Unexpected token', data: null };
		fetchMock.mockResolvedValue(iamResponse(body, 400));

		const res = await POST(
			jsonRequest('http://localhost/api/x', 'POST', 'not-json'),
			routeParams('7'),
		);

		expect(fetchMock).toHaveBeenCalledWith(
			'http://iam.test/apps-users/7/connections',
			expect.objectContaining({ body: 'not-json' }),
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual(body);
	});

	it('returns the IAM error status and body untouched', async () => {
		const body = { ok: false, msg: 'Forbidden', data: null };
		fetchMock.mockResolvedValue(iamResponse(body, 409));

		const res = await POST(
			jsonRequest('http://localhost/api/x', 'POST', created),
			routeParams('7'),
		);

		expect(res.status).toBe(409);
		expect(await res.json()).toEqual(body);
	});

	it('does not rewrite a body that is not JSON', async () => {
		fetchMock.mockResolvedValue(
			new Response('<html>Bad Gateway</html>', {
				status: 503,
				headers: { 'Content-Type': 'text/html' },
			}),
		);

		const res = await POST(
			jsonRequest('http://localhost/api/x', 'POST', created),
			routeParams('7'),
		);

		expect(res.status).toBe(503);
		expect(res.headers.get('Content-Type')).toBe('text/html');
		expect(await res.text()).toBe('<html>Bad Gateway</html>');
	});

	it('defaults the content type to JSON when IAM sends none', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

		const res = await POST(
			jsonRequest('http://localhost/api/x', 'POST', created),
			routeParams('7'),
		);

		expect(res.status).toBe(500);
		expect(res.headers.get('Content-Type')).toBe('application/json');
	});
});
