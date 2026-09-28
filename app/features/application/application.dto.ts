export interface Application {
  id: number;
  name: string;
  description: string;
}

export interface ErrorResponse {
  message?: string;
}

export interface ApplicationsListResponse {
  data?: Application[];
  message?: string;
}

export interface FetchApplicationsResult {
  ok: boolean;
  data: ApplicationsListResponse | null;
}

export interface CreateApplicationPayload {
  name: string;
  description: string;
}

export interface CreateApplicationResponse {
  data?: Application;
  message?: string;
}

export interface CreateApplicationResult {
  ok: boolean;
  data: CreateApplicationResponse | null;
}
