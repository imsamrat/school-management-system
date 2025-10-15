import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    profile?: any;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      profile?: any;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    profile?: any;
  }
}
