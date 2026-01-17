import { Request, Response, NextFunction } from 'express';
import check_jwt from '../helper/check_jwt';

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
    // try {
    //     const authHeader = req.headers['authorization'];
    //     if (!authHeader) {
    //         return res.status(200).json({
    //             code: 401,
    //             success: false,
    //             message: 'Access denied. No token provided.'
    //         });
    //     }

    //     const token = authHeader.split(' ')[1];

    //     if (!token) {
    //         return res.status(200).json({
    //             code: 401,
    //             success: false,
    //             message: 'Access denied. Invalid token format.'
    //         });
    //     }

    //     const decoded = check_jwt.verifyToken(token);
    //     if (!decoded.status) {
    //         return res.status(200).json({
    //             code: 401,
    //             success: false,
    //             message: 'Invalid or expired token.'
    //         });
    //     }
    //     next();
    // } catch (error) {
    //     return res.status(200).json({
    //         code: 403,
    //         success: false,
    //         message: 'Invalid or expired token.'
    //     });
    // }
    next();
};