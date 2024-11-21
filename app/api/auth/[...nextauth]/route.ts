import { apiConfig } from '../../route-config';
export const { dynamic, fetchCache, revalidate } = apiConfig;
import NextAuth, { AuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { User as DbUser } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

type UserRole = 'admin' | 'reseller' | 'customer';
type UserStatus = 'active' | 'pending' | 'suspended';

interface CustomUser extends Omit<User, 'image'> {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
}

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
  };
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          await dbConnect();
          
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter email and password');
          }

          // Add role to query if specified (for reseller login)
          const query: any = { email: credentials.email };
          if (credentials.role) {
            query.role = credentials.role;
          }

          const user = await DbUser.findOne(query);
          if (!user || !user.password) {
            throw new Error('Invalid credentials');
          }

          // For resellers, check approval status
          if (user.role === 'reseller' && user.status !== 'active') {
            throw new Error('Your account is pending approval or has been suspended');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image || null,
            role: user.role,
            status: user.status
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only allow credential auth for resellers
      if (account?.type === 'oauth' && (user as CustomUser).role === 'reseller') {
        return false;
      }

      if (account?.provider === 'google') {
        try {
          await dbConnect();
          let dbUser = await DbUser.findOne({ email: user.email });
          
          if (!dbUser) {
            dbUser = await DbUser.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'customer',
              status: 'active'
            });
          }

          // Don't allow Google sign-in for pending/suspended resellers
          if (dbUser.role === 'reseller' && dbUser.status !== 'active') {
            return false;
          }
          
          (user as CustomUser).id = dbUser._id.toString();
          (user as CustomUser).role = dbUser.role;
          (user as CustomUser).status = dbUser.status;
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }
      
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
        token.status = (user as CustomUser).status;
      }
      return token;
    },
    async session({ session, token }): Promise<CustomSession> {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
      }
      return session as CustomSession;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };