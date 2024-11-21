import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

export type UserRole = 'admin' | 'reseller' | 'customer';
export type UserStatus = 'active' | 'pending' | 'suspended';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: UserRole;
      status: UserStatus;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
  }
}