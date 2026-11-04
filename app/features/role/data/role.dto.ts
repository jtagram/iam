export interface Role {
	id: number;
	applicationId: number;
	name: string;
	description: string;
}

export interface CreateRolePayload {
	applicationId: number;
	name: string;
	description: string;
}

export type ApplicationRoleItem = Omit<Role, 'applicationId'>;

export interface ApplicationRoles {
	applicationId: number;
	applicationName: string;
	applicationDescription: string;
	roles: ApplicationRoleItem[];
}
