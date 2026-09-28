import type {
  CreateApplicationPayload,
  CreateApplicationResult,
  FetchApplicationsResult,
} from "@/app/features/application/application.dto";

export async function fetchApplications(
  signal?: AbortSignal,
): Promise<FetchApplicationsResult> {
  const response = await fetch("/api/applications", { signal });
  const data = (await response
    .json()
    .catch(() => null)) as FetchApplicationsResult["data"];

  return { ok: response.ok, data };
}

export async function postApplication(
  payload: CreateApplicationPayload,
): Promise<CreateApplicationResult> {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response
    .json()
    .catch(() => null)) as CreateApplicationResult["data"];

  return { ok: response.ok, data };
}
