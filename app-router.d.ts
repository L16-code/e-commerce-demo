/* eslint-disable @typescript-eslint/no-explicit-any */
// Custom type declarations to fix Next.js 15 App Router type issues

import { type NextRequest } from 'next/server';

declare module 'next/dist/server/web/exports' {
  // Override the route handler type definition to make it more permissive
  export interface RouteHandler {
    GET?: (req: NextRequest, context: any) => Promise<Response> | Response;
    POST?: (req: NextRequest, context: any) => Promise<Response> | Response;
    PUT?: (req: NextRequest, context: any) => Promise<Response> | Response;
    DELETE?: (req: NextRequest, context: any) => Promise<Response> | Response;
    PATCH?: (req: NextRequest, context: any) => Promise<Response> | Response;
    HEAD?: (req: NextRequest, context: any) => Promise<Response> | Response;
    OPTIONS?: (req: NextRequest, context: any) => Promise<Response> | Response;
  }
}
