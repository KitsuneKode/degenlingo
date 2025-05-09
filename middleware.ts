import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*) ',
  '/',
  '/api/webhooks/stripe(.*)',
])
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (
    isAdminRoute(req) &&
    (await auth()).sessionClaims?.metadata?.role !== 'admin'
  ) {
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }
    const url = new URL('/', req.url)
    return NextResponse.redirect(url)
  }
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
