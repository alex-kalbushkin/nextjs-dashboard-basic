import { QueryResult, sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { string, z } from 'zod';
import { User } from './app/lib/definitions';
import { authConfig } from './auth.config';

const getUserFormDataBase = async (
  email: string,
): Promise<User | undefined> => {
  try {
    const user: QueryResult<User> =
      await sql<User>`SELECT * from users WHERE email=${email}`;

    console.log('User fetched successfully: ', user);

    return user.rows[0];
  } catch (error) {
    console.log('Failed to fetch user: ', error);
    throw new Error('Failed to fetch user');
  }
};

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: string().email(),
            password: string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserFormDataBase(email);

          if (!user) {
            return null;
          }

          const isPasswordMatched = await bcrypt.compare(
            password,
            user.password,
          );

          if (isPasswordMatched) {
            return user;
          }
        }

        console.log('Invalid credentials');

        return null;
      },
    }),
  ],
});
