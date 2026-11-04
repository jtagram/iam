import { describe, expect, it } from 'vitest';

import { failure, readApiResult } from '../api-result';

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), { status });
}

describe('failure', () => {
	it('builds a failed envelope', () => {
		expect(failure('boom')).toEqual({ ok: false, msg: 'boom', data: null });
	});
});

describe('readApiResult', () => {
	it('returns a successful envelope as is', async () => {
		const res = jsonResponse({ ok: true, msg: 'Listo', data: [1] });

		expect(await readApiResult(res, 'fb')).toEqual({ ok: true, msg: 'Listo', data: [1] });
	});

	it('returns the error msg of a failed envelope', async () => {
		const res = jsonResponse({ ok: false, msg: 'boom', data: null }, 400);

		expect(await readApiResult(res, 'fb')).toEqual({ ok: false, msg: 'boom', data: null });
	});

	it('falls back when the body is not JSON', async () => {
		expect(await readApiResult(new Response('<html>'), 'fb')).toEqual(failure('fb'));
	});

	it.each([
		['a legacy error body', { message: 'x' }],
		['a missing data key', { ok: true, msg: 'x' }],
		['a non-boolean ok', { ok: 'yes', msg: 'x', data: null }],
		['a non-string msg', { ok: true, msg: 1, data: null }],
		['null', null],
	])('falls back for %s', async (_label, body) => {
		expect(await readApiResult(jsonResponse(body), 'fb')).toEqual(failure('fb'));
	});

	it('falls back when a failed envelope has an empty msg', async () => {
		const res = jsonResponse({ ok: false, msg: '', data: null }, 500);

		expect(await readApiResult(res, 'fb')).toEqual(failure('fb'));
	});
});
