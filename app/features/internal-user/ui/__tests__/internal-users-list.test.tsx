import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getInternalUsersWithApplications } from '../../data/internal-user.service';
import { InternalUsersList } from '../internal-users-list';

vi.mock('../../data/internal-user.service');

afterEach(() => {
	vi.resetAllMocks();
});

const internalUsers = [
	{
		id: 1,
		name: 'Ana',
		lastname: 'Gil',
		email: 'ana@b.com',
		applications: [
			{
				id: 7,
				applicationId: 10,
				application: { id: 10, name: 'billing', description: 'd' },
				roles: [
					{ id: 1, roleId: 1, role: { id: 1, name: 'admin', description: 'd' } },
					{ id: 2, roleId: 2, role: { id: 2, name: 'editor', description: 'd' } },
				],
			},
		],
	},
	{ id: 2, name: 'Luis', lastname: 'Paz', email: 'luis@b.com', applications: [] },
];

describe('InternalUsersList', () => {
	it('shows a loading message while fetching', () => {
		vi.mocked(getInternalUsersWithApplications).mockReturnValue(new Promise(() => {}));
		render(<InternalUsersList />);

		expect(screen.getByText('Cargando…')).toBeInTheDocument();
	});

	it('renders each user with email, applications and roles', async () => {
		vi.mocked(getInternalUsersWithApplications).mockResolvedValue(internalUsers);
		render(<InternalUsersList />);

		expect(await screen.findByText('Ana Gil')).toBeInTheDocument();
		expect(screen.getByText('ana@b.com')).toBeInTheDocument();
		expect(screen.getByText('billing: admin, editor')).toBeInTheDocument();
		expect(screen.getByText('Luis Paz')).toBeInTheDocument();
		expect(screen.getByText('Sin aplicaciones asignadas.')).toBeInTheDocument();
		expect(getInternalUsersWithApplications).toHaveBeenCalledTimes(1);
	});

	it('shows an empty message when there are no users', async () => {
		vi.mocked(getInternalUsersWithApplications).mockResolvedValue([]);
		render(<InternalUsersList />);

		expect(
			await screen.findByText('No hay usuarios internos creados todavía.'),
		).toBeInTheDocument();
	});

	it('shows the error when loading users fails', async () => {
		vi.mocked(getInternalUsersWithApplications).mockRejectedValue(new Error('Forbidden'));
		render(<InternalUsersList />);

		expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden');
	});

	it('aborts the request when unmounted', () => {
		vi.mocked(getInternalUsersWithApplications).mockReturnValue(new Promise(() => {}));
		const { unmount } = render(<InternalUsersList />);

		const signal = vi.mocked(getInternalUsersWithApplications).mock.calls[0][0] as AbortSignal;
		unmount();

		expect(signal.aborted).toBe(true);
	});
});
