export interface InternalUser {
	id: number;
	name: string;
	lastname: string;
	email: string;
}

export interface InternalUserWithApplications extends InternalUser {
	applications: AssignedApplication[];
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

/** A role held in an application: the assignment row with its role nested. */
export interface AssignedRoleAssignment {
	id: number;
	roleId: number;
	role: AssignedRole;
}

export interface AssignedApplicationInfo {
	id: number;
	name: string;
	description: string;
}

/** An application assignment row with its application and the roles held in it. */
export interface AssignedApplication {
	id: number;
	applicationId: number;
	application: AssignedApplicationInfo;
	roles: AssignedRoleAssignment[];
}

/** An application referenced by a connection (origin or destination). */
export interface ConnectionApplication {
	id: number;
	name: string;
}

/** An `origin -> destination` pair with both applications nested. */
export interface ApplicationConnection {
	id: number;
	originApplicationId: number;
	destinationApplicationId: number;
	originApplication: ConnectionApplication;
	destinationApplication: ConnectionApplication;
}

/** The user as the connection endpoints return it, with its connections. */
export interface InternalUserWithConnections extends InternalUser {
	connections: ApplicationConnection[];
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
