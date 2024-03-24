import { NextAuthConfig, Session } from 'next-auth';
import { NextRequest } from 'next/server';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }: {
      auth: Session | null;
      request: NextRequest;
    }) {
      const dashboardRoute = '/dashboard';

      const isLoggedIn = !!auth?.user;
      const isOnDashboardPage = nextUrl.pathname.startsWith(dashboardRoute);

      if (isOnDashboardPage) {
        return isLoggedIn || false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL(dashboardRoute, nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
