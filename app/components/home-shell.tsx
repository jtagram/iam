'use client';

import { Nav, Tab } from 'react-bootstrap';

import { AppUsersList } from '@/app/features/app-user/app-users-list';
import { AssignApplicationForm } from '@/app/features/app-user/assign-application-form';
import { AssignRoleToAppUserForm } from '@/app/features/app-user/assign-role-to-app-user-form';
import { ConnectApplicationsForAppUserForm } from '@/app/features/app-user/connect-applications-for-app-user-form';
import { CreateAppUserForm } from '@/app/features/app-user/create-app-user-form';
import { ApplicationsList } from '@/app/features/application/applications-list';
import { CreateApplicationForm } from '@/app/features/application/create-application-form';
import { AssignApplicationToInternalUserForm } from '@/app/features/internal-user/assign-application-to-internal-user-form';
import { AssignRoleToInternalUserForm } from '@/app/features/internal-user/assign-role-to-internal-user-form';
import { ConnectApplicationsForInternalUserForm } from '@/app/features/internal-user/connect-applications-for-internal-user-form';
import { CreateInternalUserForm } from '@/app/features/internal-user/create-internal-user-form';
import { InternalUsersList } from '@/app/features/internal-user/internal-users-list';
import { ApplicationRolesList } from '@/app/features/role/application-roles-list';
import { CreateRoleForm } from '@/app/features/role/create-role-form';

export function HomeShell() {
	return (
		<Tab.Container
			defaultActiveKey='create-application'
			transition={false}
		>
			<div className='d-flex flex-grow-1 overflow-hidden'>
				<Nav
					variant='pills'
					className='flex-column flex-nowrap flex-shrink-0 border-end bg-light p-3'
					style={{ width: 260, overflowY: 'auto' }}
				>
					<div className='mb-3'>
						<div className='text-uppercase small fw-bold text-muted px-2 mb-1'>Aplicaciones</div>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='create-application'>Crear aplicación</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='view-applications'>Ver aplicaciones</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='create-role'>Crear rol de aplicación</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='view-application-roles'>Ver roles de aplicaciones</Nav.Link>
						</Nav.Item>
					</div>
					<div className='mb-3'>
						<div className='text-uppercase small fw-bold text-muted px-2 mb-1'>
							Usuarios de aplicación
						</div>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='create-app-user'>Crear usuario de aplicación</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='assign-application-to-app-user'>
								Asignar aplicación a usuario de aplicación
							</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='assign-role-to-app-user'>
								Asignar rol a usuarios de aplicación
							</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='connect-applications-for-app-user'>
								Relacionar aplicaciones para usuarios de aplicación
							</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='view-app-users'>Ver usuarios de aplicación</Nav.Link>
						</Nav.Item>
					</div>
					<div className='mb-3'>
						<div className='text-uppercase small fw-bold text-muted px-2 mb-1'>
							Usuarios internos
						</div>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='create-internal-user'>Crear usuario interno</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='assign-application-to-internal-user'>
								Asignar aplicación a usuario interno
							</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='assign-role-to-internal-user'>
								Asignar rol a usuario interno
							</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='connect-applications-for-internal-user'>
								Relacionar aplicaciones para usuarios internos
							</Nav.Link>
						</Nav.Item>
						<Nav.Item className='mb-1'>
							<Nav.Link eventKey='view-internal-users'>Ver usuarios internos</Nav.Link>
						</Nav.Item>
					</div>
				</Nav>

				<Tab.Content
					className='flex-grow-1 overflow-auto p-4'
					style={{ minWidth: 0 }}
				>
					<Tab.Pane
						eventKey='create-application'
						mountOnEnter
						unmountOnExit
					>
						<CreateApplicationForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='view-applications'
						mountOnEnter
						unmountOnExit
					>
						<ApplicationsList />
					</Tab.Pane>
					<Tab.Pane
						eventKey='create-role'
						mountOnEnter
						unmountOnExit
					>
						<CreateRoleForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='view-application-roles'
						mountOnEnter
						unmountOnExit
					>
						<ApplicationRolesList />
					</Tab.Pane>
					<Tab.Pane
						eventKey='create-app-user'
						mountOnEnter
						unmountOnExit
					>
						<CreateAppUserForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='assign-application-to-app-user'
						mountOnEnter
						unmountOnExit
					>
						<AssignApplicationForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='assign-role-to-app-user'
						mountOnEnter
						unmountOnExit
					>
						<AssignRoleToAppUserForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='connect-applications-for-app-user'
						mountOnEnter
						unmountOnExit
					>
						<ConnectApplicationsForAppUserForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='view-app-users'
						mountOnEnter
						unmountOnExit
					>
						<AppUsersList />
					</Tab.Pane>
					<Tab.Pane
						eventKey='create-internal-user'
						mountOnEnter
						unmountOnExit
					>
						<CreateInternalUserForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='assign-application-to-internal-user'
						mountOnEnter
						unmountOnExit
					>
						<AssignApplicationToInternalUserForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='assign-role-to-internal-user'
						mountOnEnter
						unmountOnExit
					>
						<AssignRoleToInternalUserForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='connect-applications-for-internal-user'
						mountOnEnter
						unmountOnExit
					>
						<ConnectApplicationsForInternalUserForm />
					</Tab.Pane>
					<Tab.Pane
						eventKey='view-internal-users'
						mountOnEnter
						unmountOnExit
					>
						<InternalUsersList />
					</Tab.Pane>
				</Tab.Content>
			</div>
		</Tab.Container>
	);
}
