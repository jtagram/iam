import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/app/lib/auth-cookie";
import { requireEnv } from "@/app/lib/require-env";

interface CreateConnectionRequestBody {
  originApplicationId?: number;
  destinationApplicationId?: number;
}

interface IamErrorBody {
  message?: string | string[];
}

function extractErrorMessage(body: IamErrorBody, fallback: string): string {
  if (Array.isArray(body.message)) {
    return body.message.join(", ");
  }
  return body.message ?? fallback;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "No autenticado." },
      { status: 401 },
    );
  }

  const { id } = await params;

  const iamResponse = await fetch(
    `${IAM_API_URL}/internal-users/${id}/connections`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await iamResponse.json();

  if (!iamResponse.ok) {
    return NextResponse.json(
      {
        message: extractErrorMessage(
          data as IamErrorBody,
          "No se pudieron obtener las conexiones.",
        ),
      },
      { status: iamResponse.status },
    );
  }

  return NextResponse.json(data, { status: iamResponse.status });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "No autenticado." },
      { status: 401 },
    );
  }

  const { id } = await params;

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
    `${IAM_API_URL}/internal-users/${id}/connections`,
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

  const data = await iamResponse.json();

  if (!iamResponse.ok) {
    return NextResponse.json(
      {
        message: extractErrorMessage(
          data as IamErrorBody,
          "No se pudo crear la conexión.",
        ),
      },
      { status: iamResponse.status },
    );
  }

  return NextResponse.json(data, { status: iamResponse.status });
}
