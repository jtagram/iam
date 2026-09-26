import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/app/lib/auth-cookie";
import { requireEnv } from "@/app/lib/require-env";

const IAM_API_URL = requireEnv("IAM_API_URL", process.env.IAM_API_URL);

interface AssignRoleRequestBody {
  roleId?: number;
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "No autenticado." },
      { status: 401 },
    );
  }

  const { id } = await params;

  let body: AssignRoleRequestBody;
  try {
    body = (await request.json()) as AssignRoleRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(`${IAM_API_URL}/apps-users/${id}/roles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ roleId: body.roleId }),
  });

  const data = await iamResponse.json();

  if (!iamResponse.ok) {
    return NextResponse.json(
      {
        message: extractErrorMessage(
          data as IamErrorBody,
          "No se pudo asignar el rol al usuario.",
        ),
      },
      { status: iamResponse.status },
    );
  }

  return NextResponse.json(data, { status: iamResponse.status });
}
