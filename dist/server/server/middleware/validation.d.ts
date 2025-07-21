import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare const strictStringSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const usernameSchema: z.ZodString;
export declare const validateAudioFile: (file: Express.Multer.File) => boolean;
export declare const validateRequest: <T>(schema: z.ZodSchema<T>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const xssProtection: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
