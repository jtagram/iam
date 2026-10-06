import { NextResponse } from "next/server";
import { requireEnv } from "@/app/lib/require-env";
import {
  forwardIamResponse,
  getAuthToken,
} from "@/app/lib/iam-proxy";

interface CreateRoleRequestBody {
  applicationId?: number;
  name?: string;
  description?: string;
}

export async function GET(request: Request) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  const applicationId = new URL(request.url).searchParams.get(
    "applicationId",
  );
  if (!applicationId) {
    return NextResponse.json(
      { message: "applicationId es obligatorio." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(
    `${IAM_API_URL}/roles?applicationId=${encodeURIComponent(applicationId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return forwardIamResponse(
    iamResponse,
    "No se pudieron obtener los roles.",
  );
}

export async function POST(request: Request) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  let body: CreateRoleRequestBody;
  try {
    body = (await request.json()) as CreateRoleRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(`${IAM_API_URL}/roles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      applicationId: body.applicationId,
      name: body.name,
      description: body.description,
    }),
  });

  return forwardIamResponse(
    iamResponse,
    "No se pudo crear el rol.",
  );
}
