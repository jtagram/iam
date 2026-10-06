import { NextResponse } from "next/server";
import { requireEnv } from "@/app/lib/require-env";
import {
  forwardIamResponse,
  getAuthToken,
  invalidIdResponse,
  isValidId,
} from "@/app/lib/iam-proxy";

interface CreateConnectionRequestBody {
  originApplicationId?: number;
  destinationApplicationId?: number;
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
    `${IAM_API_URL}/apps-users/${id}/connections`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return forwardIamResponse(
    iamResponse,
    "No se pudieron obtener las conexiones.",
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

  let body: CreateConnectionRequestBody;
  try {
    body = (await request.json()) as CreateConnectionRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(
    `${IAM_API_URL}/apps-users/${id}/connections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        originApplicationId: body.originApplicationId,
        destinationApplicationId: body.destinationApplicationId,
      }),
    },
  );

  return forwardIamResponse(
    iamResponse,
    "No se pudo crear la conexión.",
  );
}
