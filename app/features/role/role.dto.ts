export interface Role {
  id: number;
  applicationId: number;
  name: string;
  description: string;
}

export interface ErrorResponse {
  message?: string;
}

export interface RolesListResponse {
  data?: Role[];
  message?: string;
}

export interface FetchRolesResult {
  ok: boolean;
  data: RolesListResponse | null;
}

export interface CreateRolePayload {
  applicationId: number;
  name: string;
  description: string;
}

export interface CreateRoleResponse {
  data?: Role;
  message?: string;
}

export interface CreateRoleResult {
  ok: boolean;
  data: CreateRoleResponse | null;
}
