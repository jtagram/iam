import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/app/lib/auth-cookie";
import { requireEnv } from "@/app/lib/require-env";

const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);

interface CreateInternalUserRequestBody {
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
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

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "No autenticado." },
      { status: 401 },
    );
  }

  const iamResponse = await fetch(`${IAM_API_URL}/internal-users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await iamResponse.json();

  if (!iamResponse.ok) {
    return NextResponse.json(
      {
        message: extractErrorMessage(
          data as IamErrorBody,
          "No se pudieron obtener los usuarios internos.",
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

  const data = await iamResponse.json();

  if (!iamResponse.ok) {
    return NextResponse.json(
      {
        message: extractErrorMessage(
          data as IamErrorBody,
          "No se pudo crear el usuario interno.",
        ),
      },
      { status: iamResponse.status },
    );
  }

  return NextResponse.json(data, { status: iamResponse.status });
}
