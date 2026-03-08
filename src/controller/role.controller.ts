import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { getJsDate, slugify } from "../utils/utils";
import { createAuditLog } from "../service/audit-log.service";
import { createRole, findAndUpdateRole, findRole, findRoles } from "../service/role.service";

const parseRoleFilters = (query: any) => {
    const { minAmount, maxAmount, transaction, parent, fee, applied, student, minDateCreated, maxDateCreated } = query; 

    const filters: any = {}; 

    // if (name) {
    //     filters.name = { $regex: name, $options: "i" }; 
    // } 

    if (applied) {
        filters.applied = applied
    } 

    if (transaction) {
        filters.transaction = transaction
    } 

    if (parent) {
        filters.parent = parent
    } 

    if (fee) {
        filters.fee = fee
    } 

    if (student) {
        filters.student = student
    } 
        
    if (minAmount && !maxAmount) {
        filters.amount = { $gte: minAmount }; 
    }

    if (maxAmount && !minAmount) {
        filters.amount = { $lte: maxAmount }; 
    }

    if (minAmount && maxAmount) {
        filters.createdAt = { $gte: minAmount, $lte: maxAmount };
    }

    if (minDateCreated && !maxDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated && !minDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }

    if (minDateCreated && maxDateCreated) {
        filters.createdAt = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    }
  
    return filters

}

export async function createRoleHandler (req: Request, res: Response) {
    const userId = get(req, 'user._id')
    const body = req.body

    const post = await createRole({ ...body, ...{createdBy: userId, slug: slugify(body.name)} })
    // return res.send(post)
    await createAuditLog({
        actionType: 'create',
        description: `created role ${body.name}`,
        actor: userId,
        item: post._id,
        requestPayload: body,
        responseObject: post
    })
    return response.created(res, post)
}

export const getRolesHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;

        const filters = parseRoleFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        
        const roles = await findRoles({deleted: false }, resPerPage, page, expand)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: roles.total,
            roles: roles.data
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function getRoleHandler (req: Request, res: Response) {
    const roleId = get(req, 'params.roleId');
    const queryObject: any = req.query;
    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    const role = await findRole({ _id: roleId, deleted: false}, expand);
    if(!role) {
        return response.notFound(res, { message: `role was not found` })
    } 
    return response.ok(res, role)
}

export async function updateRoleHandler (req: Request, res: Response) {
    const roleId = get(req, 'params.roleId');
    const userId = get(req, 'user._id');
    const updateQuery = req.body
    const role = await findRole({ _id: roleId }, '');
    if (!role) {
        return response.notFound(res, { message: `role not found` })
    }

    const updated = await findAndUpdateRole({ _id: roleId }, updateQuery, {new: true});
    
    await createAuditLog({
        actionType: 'update',
        description: `update role ${role.name}`,
        actor: userId,
        item: roleId,
        requestPayload: {...req.params, ...updateQuery},
        responseObject: {message: 'role updated successfully', role: updated}
    })
    return response.ok(res, {message: 'role updated successfully', role: updated});
}

export async function deleteRoleHandler (req: Request, res: Response) {
    const roleId = get(req, 'params.roleId');
    const userId = get(req, 'user._id');

    const role = await findRole({ _id: roleId }, '');
    if (!role) {
        return response.notFound(res, { message: `role not found` })
    }

    await findAndUpdateRole({ _id: roleId }, {deleted: true}, {new: true});
    await createAuditLog({
        actionType: 'delete',
        description: `delete role ${role.name}`,
        actor: userId,
        item: roleId,
        requestPayload: req.params,

    })
    return response.ok(res, {message: 'role deleted successfully'});
}