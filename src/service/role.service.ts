import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Role, { RoleDocument } from '../model/role.model';

export async function createRole (input: DocumentDefinition<RoleDocument>) {
    return Role.create(input)
}

export async function findRoles(
    query: FilterQuery<RoleDocument>,
    perPage: number,
    page: number,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    // return Role.find(query, {}, options).populate(expand)

    const total = await Role.find(query).countDocuments()
    const roles = await Role.find(query, {}, options).populate(expand)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage)

    return {
        total,
        data: roles
    }
}

export async function findRole(
    query: FilterQuery<RoleDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return Role.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdateRole(
    query: FilterQuery<RoleDocument>,
    update: UpdateQuery<RoleDocument>,
    options: QueryOptions
) {
    return Role.findOneAndUpdate(query, update, options)
}

export async function deleteRole(
    query: FilterQuery<RoleDocument>
) {
    return Role.deleteOne(query)
}