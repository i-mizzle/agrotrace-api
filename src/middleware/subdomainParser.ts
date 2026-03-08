import { NextFunction, Request, Response } from "express";

declare global {
    namespace Express {
        interface Request {
          businessSubdomain?: string; 
        }
    }
}

export const subdomainParser = (req: Request, res: Response, next: NextFunction) => {
  const hostHeader = (req.headers['x-original-host'] as string) || req.headers.host;
  // console.log('host header', hostHeader)
  // If it's localhost, just skip
  if (hostHeader?.startsWith('localhost')) {
    return next();
  }

  const parts = hostHeader!.split('.');
  const subdomain = parts.length > 2 ? parts[0] : null;

  if (subdomain && subdomain !== 'www' && subdomain !== 'scanserve') {
    req.businessSubdomain = subdomain;
  }

  next();
};

