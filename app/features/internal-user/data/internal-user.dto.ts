export interface InternalUser {
	id: number;
	name: string;
	lastname: string;
	email: string;
}

export interface CreateInternalUserPayload {
	name: string;
	lastname: string;
	email: string;
	password: string;
}

export interface CreatedInternalUser {
	id: number;
	name: string;
	lastname: string;
	email: string;
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

export interface AssignApplicationToInternalUserPayload {
	applicationId: number;
}

export interface AssignRoleToInternalUserPayload {
	roleId: number;
}
