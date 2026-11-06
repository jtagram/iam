import { describe, expect, it } from 'vitest';

import {
	isApplicationConnectionResponse,
	isAppUserListResponse,
	isAppUserResponse,
	isAppUserWithApplicationsResponse,
	isAppUserWithConnectionsResponse,
	isAssignedApplicationListResponse,
	isAssignedApplicationResponse,
	isCreatedAppUserResponse,
	isResponseBody,
} from '../app-user.validation';

const entity = { id: 1, clienteId: 'c1', name: 'svc', description: 'desc' };
const created = { id: 1, clienteId: 'c1', clienteSecret: 's', name: 'svc', description: 'desc' };
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

describe('isAppUserResponse', () => {
	it('accepts a valid item', () => {
		expect(isAppUserResponse(entity)).toBe(true);
	});

	it.each([
		['string id', { ...entity, id: '1' }],
		['numeric clienteId', { ...entity, clienteId: 1 }],
		['numeric name', { ...entity, name: 2 }],
		['null description', { ...entity, description: null }],
		['missing clienteId', { id: 1, name: 'a', description: 'd' }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [entity]],
	])('rejects %s', (_label, value) => {
		expect(isAppUserResponse(value)).toBe(false);
	});
});

describe('isAppUserListResponse', () => {
	it('accepts a list of valid items', () => {
		expect(isAppUserListResponse([entity, { ...entity, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isAppUserListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isAppUserListResponse([entity, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isAppUserListResponse(entity)).toBe(false);
		expect(isAppUserListResponse(null)).toBe(false);
	});
});

describe('isCreatedAppUserResponse', () => {
	it('accepts a valid created item', () => {
		expect(isCreatedAppUserResponse(created)).toBe(true);
	});

	it.each([
		['missing clienteSecret', entity],
		['numeric clienteSecret', { ...created, clienteSecret: 5 }],
		['string id', { ...created, id: '1' }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [created]],
	])('rejects %s', (_label, value) => {
		expect(isCreatedAppUserResponse(value)).toBe(false);
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

describe('isAppUserWithApplicationsResponse', () => {
	it('accepts a user with its assignment rows', () => {
		expect(
			isAppUserWithApplicationsResponse({
				...entity,
				applications: [assigned, { ...assigned, id: 6 }],
			}),
		).toBe(true);
	});

	it('accepts a user without applications', () => {
		expect(isAppUserWithApplicationsResponse({ ...entity, applications: [] })).toBe(true);
	});

	it.each([
		['a bare list of assignments', [assigned]],
		['a user without the applications key', entity],
		['non-array applications', { ...entity, applications: assigned }],
		['an assignment with the wrong shape', { ...entity, applications: [assigned, { id: 'x' }] }],
		['a non-user object with applications', { applications: [] }],
		['null', null],
	])('rejects %s', (_label, value) => {
		expect(isAppUserWithApplicationsResponse(value)).toBe(false);
	});
});

describe('isAppUserWithConnectionsResponse', () => {
	it('accepts a user with its connections', () => {
		expect(
			isAppUserWithConnectionsResponse({
				...entity,
				connections: [connection, { ...connection, id: 2 }],
			}),
		).toBe(true);
	});

	it('accepts a user without connections', () => {
		expect(isAppUserWithConnectionsResponse({ ...entity, connections: [] })).toBe(true);
	});

	it('rejects a user whose connections contain a bad item', () => {
		expect(
			isAppUserWithConnectionsResponse({ ...entity, connections: [connection, { id: 'x' }] }),
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
		expect(isAppUserWithConnectionsResponse(value)).toBe(false);
	});
});
