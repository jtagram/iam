import { NextResponse } from "next/server";
import { requireEnv } from "@/app/lib/require-env";
import {
  forwardIamResponse,
  getAuthToken,
  invalidIdResponse,
  isValidId,
} from "@/app/lib/iam-proxy";

interface AssignRoleRequestBody {
  roleId?: number;
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
    return invalidIdResponse("usuario interno");
  }

  let body: AssignRoleRequestBody;
  try {
    body = (await request.json()) as AssignRoleRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const iamResponse = await fetch(
    `${IAM_API_URL}/internal-users/${id}/roles`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roleId: body.roleId }),
    },
  );

  return forwardIamResponse(
    iamResponse,
    "No se pudo asignar el rol al usuario interno.",
  );
}
