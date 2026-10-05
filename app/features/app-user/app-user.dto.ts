export interface AppUser {
  id: number;
  clienteId: string;
  name: string;
  description: string;
}

export interface ErrorResponse {
  message?: string;
}

export interface AppUsersListResponse {
  data?: AppUser[];
  message?: string;
}

export interface FetchAppUsersResult {
  ok: boolean;
  data: AppUsersListResponse | null;
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

export interface CreateAppUserResponse {
  data?: CreatedAppUser;
  message?: string;
}

export interface CreateAppUserResult {
  ok: boolean;
  data: CreateAppUserResponse | null;
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

export interface AssignedApplicationsResponse {
  data?: AssignedApplication[];
  message?: string;
}

export interface FetchAssignedApplicationsResult {
  ok: boolean;
  data: AssignedApplicationsResponse | null;
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

export interface ConnectionsListResponse {
  data?: ApplicationConnection[];
  message?: string;
}

export interface FetchConnectionsResult {
  ok: boolean;
  data: ConnectionsListResponse | null;
}

export interface CreateConnectionResponse {
  data?: ApplicationConnection;
  message?: string;
}

export interface CreateConnectionResult {
  ok: boolean;
  data: CreateConnectionResponse | null;
}

export interface AssignApplicationToAppUserPayload {
  applicationId: number;
}

export interface AssignRoleToAppUserPayload {
  roleId: number;
}

export interface AssignResponse {
  message?: string;
}

export interface AssignResult {
  ok: boolean;
  data: AssignResponse | null;
}
