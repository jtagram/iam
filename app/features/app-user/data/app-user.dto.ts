export interface AppUser {
	id: number;
	clienteId: string;
	name: string;
	description: string;
}

export interface CreateAppUserPayload {
	name: string;
	description: string;
}

export interface CreatedAppUser {
	id: number;
	clienteId: string;
	clienteSecret: string;
	name: string;
	description: string;
}

export interface AssignedRole {
	id: number;
	name: string;
	description: string;
}

export interface AssignedApplication {
	applicationId: number;
	applicationName: string;
	applicationDescription: string;
	roles: AssignedRole[];
}

export interface ApplicationConnection {
	id: number;
	originApplicationId: number;
	originApplicationName: string;
	destinationApplicationId: number;
	destinationApplicationName: string;
}

export interface CreateConnectionPayload {
	originApplicationId: number;
	destinationApplicationId: number;
}

export interface AssignApplicationToAppUserPayload {
	applicationId: number;
}

export interface AssignRoleToAppUserPayload {
	roleId: number;
}
