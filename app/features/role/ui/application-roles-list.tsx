'use client';

import { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';

import type { ApplicationRoles } from '@/app/features/role/data/role.dto';
import { getRolesGroupedByApplication } from '@/app/features/role/data/role.service';

export function ApplicationRolesList() {
	const [applications, setApplications] = useState<ApplicationRoles[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function loadApplicationRoles() {
			try {
				setApplications(await getRolesGroupedByApplication(controller.signal));
			} catch (err) {
				if (controller.signal.aborted) return;
				setError((err as Error).message);
			}
		}

		void loadApplicationRoles();
		return () => controller.abort();
	}, []);

	return (
		<div className='max-w-lg'>
			<h2 className='mb-6 text-xl font-semibold text-black dark:text-zinc-50'>
				Ver roles de aplicaciones
			</h2>

			{error && (
				<p
					className='text-sm text-red-600 dark:text-red-400'
					role='alert'
				>
					{error}
				</p>
			)}

			{!error && applications === null && (
				<p className='text-sm text-zinc-500 dark:text-zinc-400'>Cargando…</p>
			)}

			{!error && applications !== null && applications.length === 0 && (
				<p className='text-sm text-zinc-500 dark:text-zinc-400'>
					No hay aplicaciones creadas todavía.
				</p>
			)}

			{!error && applications !== null && applications.length > 0 && (
				<ListGroup>
					{applications.map((application) => (
						<ListGroup.Item key={application.applicationId}>
							{`${application.applicationName}:${application.roles.map((role) => role.name).join(',')}`}
						</ListGroup.Item>
					))}
				</ListGroup>
			)}
		</div>
	);
}
