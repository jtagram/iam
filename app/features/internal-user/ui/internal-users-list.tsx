'use client';

import { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';

import type { InternalUserWithApplications } from '@/app/features/internal-user/data/internal-user.dto';
import { getInternalUsersWithApplications } from '@/app/features/internal-user/data/internal-user.service';

export function InternalUsersList() {
	const [internalUsers, setInternalUsers] = useState<InternalUserWithApplications[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function loadInternalUsers() {
			try {
				setInternalUsers(await getInternalUsersWithApplications(controller.signal));
			} catch (err) {
				if (controller.signal.aborted) return;
				setError((err as Error).message);
			}
		}

		void loadInternalUsers();
		return () => controller.abort();
	}, []);

	return (
		<div className='max-w-lg'>
			<h2 className='mb-6 text-xl font-semibold text-black dark:text-zinc-50'>
				Ver usuarios internos
			</h2>

			{error && (
				<p
					className='text-sm text-red-600 dark:text-red-400'
					role='alert'
				>
					{error}
				</p>
			)}

			{!error && internalUsers === null && (
				<p className='text-sm text-zinc-500 dark:text-zinc-400'>Cargando…</p>
			)}

			{!error && internalUsers !== null && internalUsers.length === 0 && (
				<p className='text-sm text-zinc-500 dark:text-zinc-400'>
					No hay usuarios internos creados todavía.
				</p>
			)}

			{!error && internalUsers !== null && internalUsers.length > 0 && (
				<ListGroup>
					{internalUsers.map((internalUser) => (
						<ListGroup.Item key={internalUser.id}>
							<div className='fw-medium'>
								{internalUser.name} {internalUser.lastname}
							</div>
							<div className='text-muted small mb-2'>{internalUser.email}</div>

							{internalUser.applications.length === 0 && (
								<div className='text-muted small'>Sin aplicaciones asignadas.</div>
							)}

							{internalUser.applications.length > 0 && (
								<ListGroup variant='flush'>
									{internalUser.applications.map((application) => (
										<ListGroup.Item
											key={application.application.id}
											className='px-0'
										>
											{application.application.name}:{' '}
											{application.roles.map((assignment) => assignment.role.name).join(', ')}
										</ListGroup.Item>
									))}
								</ListGroup>
							)}
						</ListGroup.Item>
					))}
				</ListGroup>
			)}
		</div>
	);
}
