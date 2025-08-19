/*import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
}
*/


import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes should be public (accessible without authentication)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async(auth, req) => {
  
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// The config object specifies which routes the middleware should run on.
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/'],
};