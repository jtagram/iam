import { NextResponse } from "next/server";
import { requireEnv } from "@/app/lib/require-env";
import {
  forwardIamResponse,
  getAuthToken,
} from "@/app/lib/iam-proxy";

interface CreateInternalUserRequestBody {
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
}

export async function GET() {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  const iamResponse = await fetch(`${IAM_API_URL}/internal-users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return forwardIamResponse(
    iamResponse,
    "No se pudieron obtener los usuarios internos.",
  );
}

export async function POST(request: Request) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const { token, unauthorized } = await getAuthToken();
  if (unauthorized) {
    return unauthorized;
  }

  let body: CreateInternalUserRequestBody;
  try {
    body = (await request.json()) as CreateInternalUserRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(`${IAM_API_URL}/internal-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: body.name,
      lastname: body.lastname,
      email: body.email,
      password: body.password,
    }),
  });

  return forwardIamResponse(
    iamResponse,
    "No se pudo crear el usuario interno.",
  );
}
