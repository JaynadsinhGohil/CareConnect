import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare const authController: {
    register: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    login: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    logout: (req: AuthRequest, res: Response) => Promise<void>;
    refreshToken: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    me: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    changePassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=auth.d.ts.map