import check_jwt from "@/helper/check_jwt";
import { JWTPayload } from "@/@types/auth";

export async function checkJwtToken(token?: string): Promise<{ status: boolean; data: JWTPayload | null }> {
  if (!token) {
    return { status: false, data: null };
  }
  const verify = check_jwt.verifyToken(token, { ignoreExpiration: false });
  if (!verify.status) {
    return { status: false, data: null };
  }
  return { status: true, data: verify.decoded as JWTPayload };
}
