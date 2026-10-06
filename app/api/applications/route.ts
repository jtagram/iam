import { NextResponse } from "next/server";
import { requireEnv } from "@/app/lib/require-env";
import {
  forwardIamResponse,
  getAuthToken,
} from "@/app/lib/iam-proxy";

interface CreateApplicationRequestBody {
  name?: string;
  description?: string;
}

export async function GET() {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  const iamResponse = await fetch(`${IAM_API_URL}/applications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return forwardIamResponse(
    iamResponse,
    "No se pudieron obtener las aplicaciones.",
  );
}

export async function POST(request: Request) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  let body: CreateApplicationRequestBody;
  try {
    body = (await request.json()) as CreateApplicationRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(`${IAM_API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: body.name,
      description: body.description,
    }),
  });

  return forwardIamResponse(
    iamResponse,
    "No se pudo crear la aplicación.",
  );
}
