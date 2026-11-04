import { describe, expect, it } from 'vitest';

import {
	isApplicationRolesListResponse,
	isApplicationRolesResponse,
	isResponseBody,
	isRoleListResponse,
	isRoleResponse,
} from '../role.validation';

const valid = { id: 1, applicationId: 5, name: 'admin', description: 'desc' };

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

describe('isRoleResponse', () => {
	it('accepts a valid role', () => {
		expect(isRoleResponse(valid)).toBe(true);
	});

	it.each([
		['string id', { ...valid, id: '1' }],
		['numeric name', { ...valid, name: 2 }],
		['null description', { ...valid, description: null }],
		['string applicationId', { ...valid, applicationId: '5' }],
		['missing applicationId', { id: 1, name: 'a', description: 'd' }],
		['missing id', { applicationId: 5, name: 'a', description: 'd' }],
		['missing name', { id: 1, applicationId: 5, description: 'd' }],
		['missing description', { id: 1, applicationId: 5, name: 'a' }],
		['null', null],
		['string', 'role'],
		['number', 1],
		['array', [valid]],
	])('rejects %s', (_label, value) => {
		expect(isRoleResponse(value)).toBe(false);
	});
});

describe('isRoleListResponse', () => {
	it('accepts a list of valid roles', () => {
		expect(isRoleListResponse([valid, { ...valid, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isRoleListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isRoleListResponse([valid, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isRoleListResponse(valid)).toBe(false);
		expect(isRoleListResponse(null)).toBe(false);
	});
});

const group = {
	applicationId: 1,
	applicationName: 'billing',
	applicationDescription: 'desc',
	roles: [{ id: 10, name: 'admin', description: 'd' }],
};

describe('isApplicationRolesResponse', () => {
	it('accepts a valid group', () => {
		expect(isApplicationRolesResponse(group)).toBe(true);
	});

	it('accepts a group with an empty roles array', () => {
		expect(isApplicationRolesResponse({ ...group, roles: [] })).toBe(true);
	});

	it.each([
		['string applicationId', { ...group, applicationId: '1' }],
		['numeric applicationName', { ...group, applicationName: 1 }],
		['null applicationDescription', { ...group, applicationDescription: null }],
		['missing applicationId', { ...group, applicationId: undefined }],
		['missing applicationName', { ...group, applicationName: undefined }],
		['missing applicationDescription', { ...group, applicationDescription: undefined }],
		['missing roles', { ...group, roles: undefined }],
		['non-array roles', { ...group, roles: {} }],
		['bad nested role', { ...group, roles: [{ id: 'x', name: 'a', description: 'd' }] }],
		['nested role missing name', { ...group, roles: [{ id: 1, description: 'd' }] }],
		['nested role null', { ...group, roles: [null] }],
		['null', null],
		['string', 'group'],
		['number', 1],
		['array', [group]],
	])('rejects %s', (_label, value) => {
		expect(isApplicationRolesResponse(value)).toBe(false);
	});
});

describe('isApplicationRolesListResponse', () => {
	it('accepts a list of valid groups', () => {
		expect(isApplicationRolesListResponse([group, { ...group, applicationId: 2, roles: [] }])).toBe(
			true,
		);
	});

	it('accepts an empty array', () => {
		expect(isApplicationRolesListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isApplicationRolesListResponse([group, { applicationId: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isApplicationRolesListResponse(group)).toBe(false);
		expect(isApplicationRolesListResponse(null)).toBe(false);
	});
});
