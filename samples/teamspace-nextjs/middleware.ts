import {asgardeoMiddleware, createRouteMatcher} from '@asgardeo/nextjs/middleware';

const isProtectedRoute = createRouteMatcher(['/dashboard', '/dashboard/(.*)']);

export default asgardeoMiddleware(async (asgardeo, req) => {
  if (isProtectedRoute(req)) {
    const protectionResult = await asgardeo.protectRoute();

    if (protectionResult) {
      return protectionResult;
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
