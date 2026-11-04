import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HomeShell } from '../home-shell';

vi.mock('@/app/features/application/ui/create-application-form', () => ({
	CreateApplicationForm: () => <div>stub:create-application</div>,
}));
vi.mock('@/app/features/application/ui/applications-list', () => ({
	ApplicationsList: () => <div>stub:view-applications</div>,
}));
vi.mock('@/app/features/role/ui/create-role-form', () => ({
	CreateRoleForm: () => <div>stub:create-role</div>,
}));
vi.mock('@/app/features/role/ui/application-roles-list', () => ({
	ApplicationRolesList: () => <div>stub:view-application-roles</div>,
}));
vi.mock('@/app/features/app-user/ui/create-app-user-form', () => ({
	CreateAppUserForm: () => <div>stub:create-app-user</div>,
}));
vi.mock('@/app/features/app-user/ui/assign-application-form', () => ({
	AssignApplicationForm: () => <div>stub:assign-application-to-app-user</div>,
}));
vi.mock('@/app/features/app-user/ui/assign-role-to-app-user-form', () => ({
	AssignRoleToAppUserForm: () => <div>stub:assign-role-to-app-user</div>,
}));
vi.mock('@/app/features/app-user/ui/connect-applications-for-app-user-form', () => ({
	ConnectApplicationsForAppUserForm: () => <div>stub:connect-applications-for-app-user</div>,
}));
vi.mock('@/app/features/app-user/ui/app-users-list', () => ({
	AppUsersList: () => <div>stub:view-app-users</div>,
}));
vi.mock('@/app/features/internal-user/ui/create-internal-user-form', () => ({
	CreateInternalUserForm: () => <div>stub:create-internal-user</div>,
}));
vi.mock('@/app/features/internal-user/ui/assign-application-to-internal-user-form', () => ({
	AssignApplicationToInternalUserForm: () => <div>stub:assign-application-to-internal-user</div>,
}));
vi.mock('@/app/features/internal-user/ui/assign-role-to-internal-user-form', () => ({
	AssignRoleToInternalUserForm: () => <div>stub:assign-role-to-internal-user</div>,
}));
vi.mock('@/app/features/internal-user/ui/connect-applications-for-internal-user-form', () => ({
	ConnectApplicationsForInternalUserForm: () => (
		<div>stub:connect-applications-for-internal-user</div>
	),
}));
vi.mock('@/app/features/internal-user/ui/internal-users-list', () => ({
	InternalUsersList: () => <div>stub:view-internal-users</div>,
}));

const NAV_ITEMS = [
	{ id: 'create-application', label: 'Crear aplicación' },
	{ id: 'view-applications', label: 'Ver aplicaciones' },
	{ id: 'create-role', label: 'Crear rol de aplicación' },
	{ id: 'view-application-roles', label: 'Ver roles de aplicaciones' },
	{ id: 'create-app-user', label: 'Crear usuario de aplicación' },
	{ id: 'assign-application-to-app-user', label: 'Asignar aplicación a usuario de aplicación' },
	{ id: 'assign-role-to-app-user', label: 'Asignar rol a usuarios de aplicación' },
	{
		id: 'connect-applications-for-app-user',
		label: 'Relacionar aplicaciones para usuarios de aplicación',
	},
	{ id: 'view-app-users', label: 'Ver usuarios de aplicación' },
	{ id: 'create-internal-user', label: 'Crear usuario interno' },
	{ id: 'assign-application-to-internal-user', label: 'Asignar aplicación a usuario interno' },
	{ id: 'assign-role-to-internal-user', label: 'Asignar rol a usuario interno' },
	{
		id: 'connect-applications-for-internal-user',
		label: 'Relacionar aplicaciones para usuarios internos',
	},
	{ id: 'view-internal-users', label: 'Ver usuarios internos' },
];

describe('HomeShell', () => {
	it('renders every navigation entry', () => {
		render(<HomeShell />);

		for (const item of NAV_ITEMS) {
			expect(screen.getByRole('tab', { name: item.label })).toBeInTheDocument();
		}
	});

	it('shows the first navigation item by default', () => {
		render(<HomeShell />);

		expect(screen.getByText(`stub:${NAV_ITEMS[0].id}`)).toBeInTheDocument();
	});

	it.each(NAV_ITEMS)('shows the matching view when selecting $label', async (item) => {
		render(<HomeShell />);

		await userEvent.setup().click(screen.getByRole('tab', { name: item.label }));

		expect(screen.getByText(`stub:${item.id}`)).toBeInTheDocument();
		expect(screen.getAllByText(/^stub:/)).toHaveLength(1);
	});
});
