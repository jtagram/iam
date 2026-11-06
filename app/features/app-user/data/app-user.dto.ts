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

/** The user as the assigned-applications endpoint returns it, with its assignment rows. */
export interface AppUserWithApplications extends AppUser {
	applications: AssignedApplication[];
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
export interface AppUserWithConnections extends AppUser {
	connections: ApplicationConnection[];
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
