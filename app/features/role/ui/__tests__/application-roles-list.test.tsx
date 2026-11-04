import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getRolesGroupedByApplication } from '../../data/role.service';
import { ApplicationRolesList } from '../application-roles-list';

vi.mock('../../data/role.service');

afterEach(() => {
	vi.resetAllMocks();
});

describe('ApplicationRolesList', () => {
	it('shows a loading message while fetching', () => {
		vi.mocked(getRolesGroupedByApplication).mockReturnValue(new Promise(() => {}));
		render(<ApplicationRolesList />);

		expect(screen.getByText('Cargando…')).toBeInTheDocument();
	});

	it('renders each application with its comma separated roles', async () => {
		vi.mocked(getRolesGroupedByApplication).mockResolvedValue([
			{
				applicationId: 1,
				applicationName: 'billing',
				applicationDescription: 'd',
				roles: [
					{ id: 10, name: 'admin', description: 'd' },
					{ id: 11, name: 'editor', description: 'd' },
				],
			},
			{ applicationId: 2, applicationName: 'crm', applicationDescription: 'd', roles: [] },
		]);
		render(<ApplicationRolesList />);

		expect(await screen.findByText('billing:admin,editor')).toBeInTheDocument();
		expect(screen.getByText('crm:')).toBeInTheDocument();
		expect(getRolesGroupedByApplication).toHaveBeenCalledTimes(1);
		expect(getRolesGroupedByApplication).toHaveBeenCalledWith(expect.any(AbortSignal));
	});

	it('shows an empty message when there are no applications', async () => {
		vi.mocked(getRolesGroupedByApplication).mockResolvedValue([]);
		render(<ApplicationRolesList />);

		expect(await screen.findByText('No hay aplicaciones creadas todavía.')).toBeInTheDocument();
	});

	it('shows the error when loading fails', async () => {
		vi.mocked(getRolesGroupedByApplication).mockRejectedValue(new Error('Forbidden'));
		render(<ApplicationRolesList />);

		expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden');
	});

	it('aborts the request when unmounted', () => {
		vi.mocked(getRolesGroupedByApplication).mockReturnValue(new Promise(() => {}));
		const { unmount } = render(<ApplicationRolesList />);

		const signal = vi.mocked(getRolesGroupedByApplication).mock.calls[0][0] as AbortSignal;
		unmount();

		expect(signal.aborted).toBe(true);
	});

	it('ignores an error from an aborted request', async () => {
		let reject: (error: Error) => void = () => {};
		vi.mocked(getRolesGroupedByApplication).mockReturnValue(
			new Promise((_resolve, rej) => {
				reject = rej;
			}),
		);
		const { unmount } = render(<ApplicationRolesList />);
		unmount();
		reject(new Error('late'));
		await Promise.resolve();

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});
});
