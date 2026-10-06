import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/app/lib/auth-cookie";

export interface IamErrorBody {
  message?: string | string[];
}

/** Status returned when IAM answers successfully but its body is not valid JSON. */
export const UNREADABLE_IAM_BODY_STATUS = 502;

export function extractErrorMessage(
  body: IamErrorBody | null | undefined,
  fallback: string,
): string {
  if (Array.isArray(body?.message)) {
    return body.message.join(", ");
  }
  return body?.message ?? fallback;
}

export type AuthResult =
  | { token: string; unauthorized?: undefined }
  | { token?: undefined; unauthorized: NextResponse };

/** Reads the session token from the cookie, or builds the 401 response. */
export async function getAuthToken(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return {
      unauthorized: NextResponse.json(
        { message: "No autenticado." },
        { status: 401 },
      ),
    };
  }

  return { token };
}

/** IAM ids are integers (`ParseIntPipe` / `PrimaryGeneratedColumn` in iam-api). */
export function isValidId(id: string): boolean {
  return /^\d+$/.test(id);
}

export function invalidIdResponse(label = "usuario"): NextResponse {
  return NextResponse.json(
    { message: `El identificador de ${label} es inválido.` },
    { status: 400 },
  );
}

/** Parses the body as JSON; `null` when it is empty or not JSON. */
export async function readIamBody<T>(
  iamResponse: Response,
): Promise<T | null> {
  return (await iamResponse.json().catch(() => null)) as T | null;
}

/**
 * Translates an IAM response into the route response, preserving IAM's
 * status. A non-JSON body never throws: errors fall back to `fallback` with
 * IAM's status; an OK status with an unreadable body becomes a 502.
 */
export async function forwardIamResponse(
  iamResponse: Response,
  fallback: string,
): Promise<NextResponse> {
  const data = await readIamBody<IamErrorBody>(iamResponse);

  if (!iamResponse.ok) {
    return NextResponse.json(
      { message: extractErrorMessage(data, fallback) },
      { status: iamResponse.status },
    );
  }

  if (data === null) {
    return NextResponse.json(
      { message: fallback },
      { status: UNREADABLE_IAM_BODY_STATUS },
    );
  }

  return NextResponse.json(data, { status: iamResponse.status });
}
