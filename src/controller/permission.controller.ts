import { Request, Response } from "express";
import * as response from '../responses'
import { accountPermissionsList } from "../static/permissions";


export async function getPermissionsHandler(req: Request, res: Response) {
    return response.ok(res, {permissions: accountPermissionsList})
}
