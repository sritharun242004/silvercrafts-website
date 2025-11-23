import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isTemporary: boolean;
      companyName?: string | null;
      gstNo?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isTemporary: boolean;
    companyName?: string | null;
    gstNo?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    isTemporary: boolean;
    companyName?: string | null;
    gstNo?: string | null;
  }
}
