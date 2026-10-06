import { NextResponse } from "next/server";
import { requireEnv } from "@/app/lib/require-env";
import {
  forwardIamResponse,
  getAuthToken,
  invalidIdResponse,
  isValidId,
} from "@/app/lib/iam-proxy";

interface AssignApplicationRequestBody {
  applicationId?: number;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  if (!isValidId(id)) {
    return invalidIdResponse();
  }

  const iamResponse = await fetch(
    `${IAM_API_URL}/apps-users/${id}/applications`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return forwardIamResponse(
    iamResponse,
    "No se pudieron obtener las aplicaciones asignadas.",
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  if (!isValidId(id)) {
    return invalidIdResponse();
  }

  let body: AssignApplicationRequestBody;
  try {
    body = (await request.json()) as AssignApplicationRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(
    `${IAM_API_URL}/apps-users/${id}/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ applicationId: body.applicationId }),
    },
  );

  return forwardIamResponse(
    iamResponse,
    "No se pudo asignar la aplicación al usuario.",
  );
}
