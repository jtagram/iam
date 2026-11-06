import { describe, expect, it } from 'vitest';

import {
	isApplicationConnectionResponse,
	isAssignedApplicationListResponse,
	isAssignedApplicationResponse,
	isInternalUserListResponse,
	isInternalUserResponse,
	isInternalUserWithApplicationsListResponse,
	isInternalUserWithApplicationsResponse,
	isInternalUserWithConnectionsResponse,
	isResponseBody,
} from '../internal-user.validation';

const entity = { id: 1, name: 'Ana', lastname: 'Pérez', email: 'ana@x.com' };
const assigned = {
	id: 5,
	applicationId: 2,
	application: { id: 2, name: 'app', description: 'd' },
	roles: [{ id: 8, roleId: 3, role: { id: 3, name: 'admin', description: 'r' } }],
};
const connection = {
	id: 1,
	originApplicationId: 1,
	destinationApplicationId: 2,
	originApplication: { id: 1, name: 'a' },
	destinationApplication: { id: 2, name: 'b' },
};

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

describe('isInternalUserResponse', () => {
	it('accepts a valid item', () => {
		expect(isInternalUserResponse(entity)).toBe(true);
	});

	it.each([
		['string id', { ...entity, id: '1' }],
		['numeric name', { ...entity, name: 2 }],
		['numeric lastname', { ...entity, lastname: 2 }],
		['null email', { ...entity, email: null }],
		['missing email', { id: 1, name: 'a', lastname: 'l' }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [entity]],
	])('rejects %s', (_label, value) => {
		expect(isInternalUserResponse(value)).toBe(false);
	});
});

describe('isInternalUserListResponse', () => {
	it('accepts a list of valid items', () => {
		expect(isInternalUserListResponse([entity, { ...entity, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isInternalUserListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isInternalUserListResponse([entity, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isInternalUserListResponse(entity)).toBe(false);
		expect(isInternalUserListResponse(null)).toBe(false);
	});
});

describe('isAssignedApplicationResponse', () => {
	it('accepts a valid assigned application', () => {
		expect(isAssignedApplicationResponse(assigned)).toBe(true);
	});

	it.each([
		['string applicationId', { ...assigned, applicationId: '2' }],
		['string id', { ...assigned, id: '5' }],
		['missing application', { id: 5, applicationId: 2, roles: [] }],
		[
			'numeric application name',
			{ ...assigned, application: { id: 2, name: 1, description: 'd' } },
		],
		[
			'numeric application description',
			{ ...assigned, application: { id: 2, name: 'a', description: 1 } },
		],
		[
			'string application id',
			{ ...assigned, application: { id: '2', name: 'a', description: 'd' } },
		],
		[
			'legacy flat shape',
			{ applicationId: 2, applicationName: 'a', applicationDescription: 'd', roles: [] },
		],
		['missing roles', { id: 5, applicationId: 2, application: assigned.application }],
		['non-array roles', { ...assigned, roles: {} }],
		['a bad role', { ...assigned, roles: [{ id: 'x' }] }],
		['a role assignment without nested role', { ...assigned, roles: [{ id: 8, roleId: 3 }] }],
		[
			'a flat role instead of a role assignment',
			{ ...assigned, roles: [{ id: 3, name: 'admin', description: 'r' }] },
		],
		[
			'a nested role with a bad name',
			{ ...assigned, roles: [{ id: 8, roleId: 3, role: { id: 3, name: 1, description: 'r' } }] },
		],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [assigned]],
	])('rejects %s', (_label, value) => {
		expect(isAssignedApplicationResponse(value)).toBe(false);
	});
});

describe('isAssignedApplicationListResponse', () => {
	it('accepts a list of valid items', () => {
		expect(isAssignedApplicationListResponse([assigned, { ...assigned, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isAssignedApplicationListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isAssignedApplicationListResponse([assigned, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isAssignedApplicationListResponse(assigned)).toBe(false);
		expect(isAssignedApplicationListResponse(null)).toBe(false);
	});
});

describe('isInternalUserWithApplicationsResponse', () => {
	it('accepts a user with applications', () => {
		expect(isInternalUserWithApplicationsResponse({ ...entity, applications: [assigned] })).toBe(
			true,
		);
	});

	it('accepts a user without applications', () => {
		expect(isInternalUserWithApplicationsResponse({ ...entity, applications: [] })).toBe(true);
	});

	it.each([
		['missing applications', entity],
		['non-array applications', { ...entity, applications: 'x' }],
		['a malformed application', { ...entity, applications: [{ id: 'x' }] }],
		['a malformed user', { id: '1', applications: [] }],
		['null', null],
	])('rejects %s', (_label, value) => {
		expect(isInternalUserWithApplicationsResponse(value)).toBe(false);
	});
});

describe('isInternalUserWithApplicationsListResponse', () => {
	it('accepts a list of valid items and an empty array', () => {
		expect(
			isInternalUserWithApplicationsListResponse([{ ...entity, applications: [assigned] }]),
		).toBe(true);
		expect(isInternalUserWithApplicationsListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(
			isInternalUserWithApplicationsListResponse([{ ...entity, applications: [] }, entity]),
		).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isInternalUserWithApplicationsListResponse({ ...entity, applications: [] })).toBe(false);
		expect(isInternalUserWithApplicationsListResponse(null)).toBe(false);
	});
});

describe('isApplicationConnectionResponse', () => {
	it('accepts a valid connection', () => {
		expect(isApplicationConnectionResponse(connection)).toBe(true);
	});

	it.each([
		['string id', { ...connection, id: '1' }],
		['string originApplicationId', { ...connection, originApplicationId: '1' }],
		['missing originApplication', { ...connection, originApplication: undefined }],
		['numeric originApplication name', { ...connection, originApplication: { id: 1, name: 1 } }],
		['string destinationApplicationId', { ...connection, destinationApplicationId: '2' }],
		['missing destinationApplication', { ...connection, destinationApplication: undefined }],
		[
			'string destinationApplication id',
			{ ...connection, destinationApplication: { id: '2', name: 'b' } },
		],
		['missing fields', { id: 1 }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [connection]],
	])('rejects %s', (_label, value) => {
		expect(isApplicationConnectionResponse(value)).toBe(false);
	});
});

describe('isInternalUserWithConnectionsResponse', () => {
	it('accepts a user with its connections', () => {
		expect(
			isInternalUserWithConnectionsResponse({
				...entity,
				connections: [connection, { ...connection, id: 2 }],
			}),
		).toBe(true);
	});

	it('accepts a user without connections', () => {
		expect(isInternalUserWithConnectionsResponse({ ...entity, connections: [] })).toBe(true);
	});

	it('rejects a user whose connections contain a bad item', () => {
		expect(
			isInternalUserWithConnectionsResponse({ ...entity, connections: [connection, { id: 'x' }] }),
		).toBe(false);
	});

	it.each([
		['a bare list of connections', [connection]],
		['a user without the connections key', entity],
		['non-array connections', { ...entity, connections: connection }],
		[
			'a connection without nested applications',
			{ ...entity, connections: [{ id: 1, originApplicationId: 1, destinationApplicationId: 2 }] },
		],
		['a non-user object with connections', { connections: [] }],
		['null', null],
	])('rejects %s', (_label, value) => {
		expect(isInternalUserWithConnectionsResponse(value)).toBe(false);
	});
});
