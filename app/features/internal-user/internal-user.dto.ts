export interface InternalUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
}

export interface ErrorResponse {
  message?: string;
}

export type InternalUsersListResponse = InternalUser[] | ErrorResponse;

export interface FetchInternalUsersResult {
  ok: boolean;
  data: InternalUsersListResponse | null;
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

export type CreateInternalUserResponse = Partial<CreatedInternalUser> &
  ErrorResponse;

export interface CreateInternalUserResult {
  ok: boolean;
  data: CreateInternalUserResponse | null;
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

export type AssignedApplicationsListResponse =
  | AssignedApplication[]
  | ErrorResponse;

export interface FetchAssignedApplicationsResult {
  ok: boolean;
  data: AssignedApplicationsListResponse | null;
}

export interface AssignApplicationToInternalUserPayload {
  applicationId: number;
}

export interface AssignRoleToInternalUserPayload {
  roleId: number;
}

export interface AssignResponse {
  message?: string;
}

export interface AssignResult {
  ok: boolean;
  data: AssignResponse | null;
}
