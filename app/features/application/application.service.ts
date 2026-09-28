import {
  fetchApplications,
  postApplication,
} from "@/app/features/application/application.connector";
import type {
  Application,
  CreateApplicationPayload,
  CreateApplicationResult,
  FetchApplicationsResult,
} from "@/app/features/application/application.dto";

export async function getApplications(
  signal?: AbortSignal,
): Promise<Application[]> {
  let result: FetchApplicationsResult;
  try {
    result = await fetchApplications(signal);
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(
      result.data?.message ?? "No se pudieron obtener las aplicaciones.",
    );
  }

  return result.data?.data ?? [];
}

export async function createApplication(
  payload: CreateApplicationPayload,
): Promise<Application | null> {
  let result: CreateApplicationResult;
  try {
    result = await postApplication(payload);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(result.data?.message ?? "No se pudo crear la aplicación.");
  }

  return result.data?.data ?? null;
}
