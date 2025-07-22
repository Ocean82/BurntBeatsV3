/**
 * Express Session Type Declarations Fix
 * This file provides type declarations for express-session to resolve compilation issues
 */

declare module 'express-session' {
  import { Request, Response, NextFunction } from 'express';

  interface SessionOptions {
    secret: string | string[];
    name?: string;
    store?: any;
    cookie?: {
      maxAge?: number;
      signed?: boolean;
      expires?: Date | boolean;
      httpOnly?: boolean;
      path?: string;
      domain?: string;
      secure?: boolean | 'auto';
      sameSite?: boolean | 'lax' | 'strict' | 'none';
    };
    genid?: (req: Request) => string;
    rolling?: boolean;
    resave?: boolean;
    proxy?: boolean;
    saveUninitialized?: boolean;
    unset?: 'destroy' | 'keep';
  }

  interface SessionData {
    [key: string]: any;
    userId?: string;
    user?: any;
    isAuthenticated?: boolean;
  }

  interface Session extends SessionData {
    id: string;
    regenerate(callback: (err?: any) => void): void;
    destroy(callback: (err?: any) => void): void;
    reload(callback: (err?: any) => void): void;
    save(callback?: (err?: any) => void): void;
    touch(): void;
  }

  function session(options: SessionOptions): (req: Request, res: Response, next: NextFunction) => void;

  export = session;
}

declare global {
  namespace Express {
    interface Request {
      session: import('express-session').Session;
      sessionID: string;
    }
  }
}
