import { Request, Response, NextFunction } from "express";
import log from '../logger'
import * as response from "../responses/index";
import { get } from "lodash";
import { findUser } from "../service/user.service";

const requiresPermissions = (requiredPermissions: Array<string>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = get(req, 'user');
        if(!user || user === undefined){
            response.forbidden(res, { message: "You do not have the required permissions to access this resource" })
            return
        }

        const userDetails = await findUser(
            { _id: user['_id'] },
            ['organizationRoles.roles', 'adminRoles']
        );

        if (!userDetails) {
            response.forbidden(res, { message: "You do not have the required permissions to access this resource" })
            return
        }

        const organizationRolePermissions =
            (userDetails.organizationRoles?.roles || []).flatMap((role: any) => role?.permissions || []);

        const adminRolePermissions =
            (userDetails.adminRoles || []).flatMap((role: any) => role?.permissions || []);

        const requestPermissions = Array.isArray(req.permissions) ? req.permissions : [];
        const permissions = [...new Set([
            ...requestPermissions,
            ...organizationRolePermissions,
            ...adminRolePermissions,
        ])];

        const hasPermissions = permissions.filter(item => requiredPermissions.includes(item));

        if (hasPermissions.length < 1) {
            response.forbidden(res, { message: "You do not have the required permissions to access this resource" })
            return
        } 
        return next()

    } catch (error: any) {
        log.error(error)
        response.forbidden(res, { message: error.errors })
    }
}

export default requiresPermissions; 