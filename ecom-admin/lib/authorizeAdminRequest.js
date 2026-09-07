import { getServerSession } from "next-auth";
import { adminEmails, authOptions } from "@/lib/authConfig";

export async function authorizeAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email?.toLowerCase();

  if (!adminEmails.includes(email)) {
    res.status(401).end();
    throw new Error("User is not an Admin.");
  }

  return session;
}