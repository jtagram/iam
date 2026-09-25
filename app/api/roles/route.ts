import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/app/lib/auth-cookie";

const IAM_API_URL = process.env.IAM_API_URL ?? "http://localhost:3000";

interface CreateRoleRequestBody {
  applicationId?: number;
  name?: string;
  description?: string;
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

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "No autenticado." },
      { status: 401 },
    );
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

  const data = await iamResponse.json();

  if (!iamResponse.ok) {
    return NextResponse.json(
      {
        message: extractErrorMessage(
          data as IamErrorBody,
          "No se pudieron obtener los roles.",
        ),
      },
      { status: iamResponse.status },
    );
  }

  return NextResponse.json(data, { status: iamResponse.status });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "No autenticado." },
      { status: 401 },
    );
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

  const data = await iamResponse.json();

  if (!iamResponse.ok) {
    return NextResponse.json(
      {
        message: extractErrorMessage(
          data as IamErrorBody,
          "No se pudo crear el rol.",
        ),
      },
      { status: iamResponse.status },
    );
  }

  return NextResponse.json(data, { status: iamResponse.status });
}
