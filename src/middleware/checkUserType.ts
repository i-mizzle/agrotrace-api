import { get } from 'lodash'
import { Request, Response, NextFunction, request } from 'express'
import * as response from "../responses/index";


const checkUserType = async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.userType === 'ADMIN' || req.body.userType === 'SUPER_ADMINISTRATOR') {
        return response.forbidden(res, { message: 'Sorry, you cannot signup as a system administrator' })
    }
    return next();
}

export default checkUserType