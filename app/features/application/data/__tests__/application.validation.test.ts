import { describe, expect, it } from 'vitest';

import {
	isApplicationListResponse,
	isApplicationResponse,
	isResponseBody,
} from '../application.validation';

const valid = { id: 1, name: 'app', description: 'desc' };

describe('isResponseBody', () => {
	it.each([
		['an ok envelope', { ok: true, msg: 'x', data: 'a' }],
		['a failed envelope', { ok: false, msg: 'x', data: null }],
		['an envelope with undefined data', { ok: true, msg: '', data: undefined }],
	])('accepts %s', (_label, body) => {
		expect(isResponseBody(body)).toBe(true);
	});

	it.each([
		['null', null],
		['an array', []],
		['a string', 'x'],
		['missing ok', { msg: 'x', data: 'a' }],
		['non-boolean ok', { ok: 'true', msg: 'x', data: 'a' }],
		['missing msg', { ok: true, data: 'a' }],
		['non-string msg', { ok: true, msg: 1, data: 'a' }],
		['missing data', { ok: true, msg: 'x' }],
	])('rejects %s', (_label, body) => {
		expect(isResponseBody(body)).toBe(false);
	});
});

describe('isApplicationResponse', () => {
	it('accepts a valid application', () => {
		expect(isApplicationResponse(valid)).toBe(true);
	});

	it.each([
		['string id', { ...valid, id: '1' }],
		['numeric name', { ...valid, name: 2 }],
		['null description', { ...valid, description: null }],
		['missing id', { name: 'a', description: 'd' }],
		['missing name', { id: 1, description: 'd' }],
		['missing description', { id: 1, name: 'a' }],
		['null', null],
		['string', 'app'],
		['number', 1],
		['array', [valid]],
	])('rejects %s', (_label, value) => {
		expect(isApplicationResponse(value)).toBe(false);
	});
});

describe('isApplicationListResponse', () => {
	it('accepts a list of valid applications', () => {
		expect(isApplicationListResponse([valid, { ...valid, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isApplicationListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isApplicationListResponse([valid, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isApplicationListResponse(valid)).toBe(false);
		expect(isApplicationListResponse(null)).toBe(false);
	});
});
