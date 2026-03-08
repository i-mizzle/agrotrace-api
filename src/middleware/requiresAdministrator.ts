import { get } from 'lodash'
import { Request, Response, NextFunction, request } from 'express'
import * as response from "../responses/index";
import { findUser } from '../service/user.service';


const requiresAdministrator = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = get(req, 'user');
    if (!user || (user.userType !== 'admin' && user.userType !== 'super-administrator')) {
        return response.forbidden(res, { message: 'Sorry, you must be logged in as a system administrator to access this resource' })
    }

    const userDetails = await findUser({_id: user['_id']}, 'adminRoles')
    const permissions = userDetails?.adminRoles?.flatMap((role: any) => role.permissions)

    req.permissions = permissions as string[]

    return next();
}

export default requiresAdministrator