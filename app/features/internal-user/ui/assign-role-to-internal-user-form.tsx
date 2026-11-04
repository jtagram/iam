'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useForm, useWatch } from 'react-hook-form';

import type { Application } from '@/app/features/application/data/application.dto';
import { getApplications } from '@/app/features/application/data/application.service';
import type { InternalUser } from '@/app/features/internal-user/data/internal-user.dto';
import {
	assignRoleToInternalUser,
	getInternalUsers,
} from '@/app/features/internal-user/data/internal-user.service';
import type { Role } from '@/app/features/role/data/role.dto';
import { getRolesByApplication } from '@/app/features/role/data/role.service';
import { notifyError, notifySuccess } from '@/app/lib/notify';

interface AssignRoleToInternalUserFormValues {
	internalUserId: string;
	applicationId: string;
	roleId: string;
}

export function AssignRoleToInternalUserForm() {
	const [internalUsers, setInternalUsers] = useState<InternalUser[] | null>(null);
	const [internalUsersError, setInternalUsersError] = useState<string | null>(null);

	const [applications, setApplications] = useState<Application[] | null>(null);
	const [applicationsError, setApplicationsError] = useState<string | null>(null);

	const [roles, setRoles] = useState<Role[] | null>(null);
	const [rolesError, setRolesError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		resetField,
		reset,
		formState: { isSubmitting, isValid },
	} = useForm<AssignRoleToInternalUserFormValues>({
		mode: 'onChange',
		defaultValues: { internalUserId: '', applicationId: '', roleId: '' },
	});

	const applicationId = useWatch({ control, name: 'applicationId' });

	useEffect(() => {
		const controller = new AbortController();

		async function loadInternalUsers() {
			try {
				const loaded = await getInternalUsers(controller.signal);
				setInternalUsers(loaded);
			} catch (err) {
				if (controller.signal.aborted) return;
				setInternalUsersError((err as Error).message);
			}
		}

		void loadInternalUsers();
		return () => controller.abort();
	}, []);

	useEffect(() => {
		const controller = new AbortController();

		async function loadApplications() {
			try {
				const loaded = await getApplications(controller.signal);
				setApplications(loaded);
			} catch (err) {
				if (controller.signal.aborted) return;
				setApplicationsError((err as Error).message);
			}
		}

		void loadApplications();
		return () => controller.abort();
	}, []);

	useEffect(() => {
		if (!applicationId) {
			return;
		}

		const controller = new AbortController();

		async function loadRoles() {
			setRoles(null);
			resetField('roleId');
			setRolesError(null);

			try {
				const loaded = await getRolesByApplication(applicationId, controller.signal);
				setRoles(loaded);
			} catch (err) {
				if (controller.signal.aborted) return;
				setRolesError((err as Error).message);
			}
		}

		void loadRoles();
		return () => controller.abort();
	}, [applicationId, resetField]);

	const onSubmit = handleSubmit(async (data) => {
		try {
			await assignRoleToInternalUser(data.internalUserId, {
				roleId: Number(data.roleId),
			});

			notifySuccess('Rol asignado correctamente.');
			reset();
		} catch (err) {
			notifyError((err as Error).message);
		}
	});

	return (
		<div style={{ maxWidth: 480 }}>
			<h2 className='h4 mb-4'>Asignar rol a usuario interno</h2>

			<Form onSubmit={onSubmit}>
				<Form.Group
					className='mb-3'
					controlId='assignRoleInternalUserId'
				>
					<Form.Label className='required-label'>Usuario interno</Form.Label>
					<Form.Select
						aria-required='true'
						{...register('internalUserId', { required: true })}
					>
						<option
							value=''
							disabled
						>
							Seleccionar
						</option>
						{internalUsers?.map((internalUser) => (
							<option
								key={internalUser.id}
								value={internalUser.id}
							>
								{internalUser.name} {internalUser.lastname}
							</option>
						))}
					</Form.Select>
					{internalUsersError && (
						<Alert
							variant='danger'
							className='mt-2'
						>
							{internalUsersError}
						</Alert>
					)}
					{!internalUsersError && internalUsers === null && (
						<Form.Text className='text-muted'>Cargando…</Form.Text>
					)}
				</Form.Group>

				<Form.Group
					className='mb-3'
					controlId='assignRoleInternalUserApplicationId'
				>
					<Form.Label className='required-label'>Aplicación</Form.Label>
					<Form.Select
						aria-required='true'
						{...register('applicationId', { required: true })}
					>
						<option
							value=''
							disabled
						>
							Seleccionar
						</option>
						{applications?.map((application) => (
							<option
								key={application.id}
								value={application.id}
							>
								{application.name}
							</option>
						))}
					</Form.Select>
					{applicationsError && (
						<Alert
							variant='danger'
							className='mt-2'
						>
							{applicationsError}
						</Alert>
					)}
					{!applicationsError && applications === null && (
						<Form.Text className='text-muted'>Cargando…</Form.Text>
					)}
				</Form.Group>

				<Form.Group
					className='mb-4'
					controlId='assignRoleInternalUserRoleId'
				>
					<Form.Label className='required-label'>Rol</Form.Label>
					<Form.Select
						aria-required='true'
						{...register('roleId', { required: true })}
					>
						<option
							value=''
							disabled
						>
							Seleccionar
						</option>
						{roles?.map((role) => (
							<option
								key={role.id}
								value={role.id}
							>
								{role.name}
							</option>
						))}
					</Form.Select>
					{rolesError && (
						<Alert
							variant='danger'
							className='mt-2'
						>
							{rolesError}
						</Alert>
					)}
					{!rolesError && applicationId && roles === null && (
						<Form.Text className='text-muted'>Cargando…</Form.Text>
					)}
				</Form.Group>

				<Button
					type='submit'
					variant='dark'
					disabled={isSubmitting || !isValid}
				>
					{isSubmitting ? 'Asignando…' : 'Asignar'}
				</Button>
			</Form>
		</div>
	);
}
