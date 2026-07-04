import { Request, Response } from "express";
import { changePassword, createUser, deleteUser, findAllUsers, findAndUpdateUser, findUser, validatePassword } from '../service/user.service'
import { get, omit } from "lodash";
import * as response from "../responses/index";
import log from "../logger";
import { enqueueAuditLog } from "../queues/audit-log.queue";
import { addMinutesToDate, getJsDate } from "../utils/utils";
import mongoose from "mongoose";

import config from 'config';
import { nanoid } from "nanoid";
import { createConfirmationCode, findAndUpdateConfirmation, findConfirmationCode } from "../service/confirmation-code.service";
import { sendEmailJob } from "../queues/email.queue";
import { findRole } from "../service/role.service";
import { ProducerDocument } from "../model/producer.model";
import { ExporterDocument } from "../model/exporter.model";
import { RegulatorDocument } from "../model/regulator.model";
import { InspectorDocument } from "../model/inspector.model";
import { createProducer } from "../service/producer.service";
import { createExporter } from "../service/exporter.service";
import { createRegulator } from "../service/regulator.service";
import { createInspector } from "../service/inspector.service";
const tokenTtl = config.get('resetTokenTtl') as number

const parseUserFilters = (query: any) => {
    const { email, name, phone, userType, minDateCreated, maxDateCreated } = query; 

    const filters: any = {}; 

    if (email) {
        filters.email = email
    } 
    
    if (name) {
        filters.name = name
    }
    
    if (phone) {
        filters.phone = phone
    }

    if (userType) {
        const types = userType.split(',').map((type: string) => type.trim())
        filters.userType = { $in: types }
    }
            
    if (minDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }
  
    return filters

}

export async function signupHandler(req: Request, res: Response) {
    try {
        const existingUserByEmail = await findUser({ email: req.body.email })
        if (existingUserByEmail) {
            return response.conflict(res, {message: 'email already registered'})
        }

        const existingUserByPhone = await findUser({ phone: req.body.phone })
        if (existingUserByPhone) {
            return response.conflict(res, {message: 'phone number already registered'})
        }

        // const existingUserByUsername = await findUser({ phone: req.body.username })
        // if (existingUserByUsername) {
        //     return response.conflict(res, {message: 'username already registered'})
        // }
        
        const input = req.body

        const user = await createUser({...input})

        if(user) {
            const code = nanoid(6).toUpperCase()
            const confirmationCode = await createConfirmationCode({
                code: code,
                type: 'email-confirmation',
                expiry: addMinutesToDate(new Date(), tokenTtl)
            })
            
            await findAndUpdateUser({_id: user._id}, {
                confirmationCode: confirmationCode._id
            }, {new: true})

            sendEmailJob({
                action: 'email-confirmation-notification',
                data: {
                    mailTo: user.email,
                    firstName: user.name.split(' ')[0],
                    activationCode: code,
                    subdomain: input.subdomain   
                }
            })
        }

        // update user with the business and a business administrator role

        return response.created(res, 
            omit(user.toJSON(), ['password'])
        )
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function confirmEmailHandler(req: Request, res: Response) {
    try {
        const confirmationCode = await findConfirmationCode({code: req.body.confirmationCode, type: 'email-confirmation'})

        if (!confirmationCode) {
            return response.notFound(res, { message: `invalid confirmation code` })
        } 

        const timeNow = new Date()
        if(!confirmationCode.createdAt) {
            return
        }
    
        if (timeNow > confirmationCode.expiry) {
            return response.conflict(res, {message: "Sorry, confirmation code has expired, please get a new code"})
        }

        const user = await findUser({ confirmationCode: confirmationCode._id, emailConfirmed: false });
        if(!user) {
            return response.conflict(res, {message: "email already confirmed, please log in"})
        }

        const code = nanoid(45)
        const stateToken = await createConfirmationCode({
            code: code,
            type: 'signup-completion',
            expiry: addMinutesToDate(new Date(), tokenTtl)
        })

        const updatedUser = await findAndUpdateUser({ _id: user._id }, {
            emailConfirmed: true,
            confirmationCode: stateToken._id
        }, { new: true })

        await findAndUpdateConfirmation({ _id: confirmationCode._id }, { valid: false }, { new: true })

        if(!updatedUser) {
            return response.error(res, {message: 'sorry there was an error updating the user'})
        }

        return response.ok(res, {
            message: 'email confirmed successfully',
            stateToken: stateToken.code
            // data: omit(updatedUser, ['_id', 'password', 'confirmationToken'])
        })
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function resendEmailConfirmationHandler(req: Request, res: Response) {
    try {        
        const invitationId = req.params.invitationId
        const user = await findUser({email: req.body.email, emailConfirmed: false})

        if(!user) {
            return response.notFound(res, {message: 'user not found or email already confirmed'})
        }

        await findAndUpdateConfirmation({_id: user.confirmationCode}, {valid: false}, {new: true})
        // const invitation = await findInvitation({_id: invitationId})
        // const userId = get(res, 'user.id')
        const newCode = nanoid(45)
        const newConfirmationCode = await createConfirmationCode({
            code: newCode,
            type: 'email_confirmation',
            expiry: addMinutesToDate(new Date(), tokenTtl)
        })

        await findAndUpdateUser({_id: user._id}, {confirmationCode: newConfirmationCode._id}, {new: true})

        // const resent = await resendInvitation(req.body.invitationCode)

        sendEmailJob({
            action: 'email-confirmation-notification',
            data: {
                firstName: user.name.split(' ')[0],
                activationCode: newCode,
            }
        })

        return response.ok(res, {message: 'confirmation email resent'})
        // }
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function completeSignupHandler(req: Request, res: Response) {
    try {
        const body = req.body;
        const signupType = (body.userType || body.type || '').toLowerCase();
        
        const confirmationCode = await findConfirmationCode({code: body.stateToken, type: 'signup-completion', valid: true})

        if (!confirmationCode) {
            return response.notFound(res, { message: `invalid state token` })
        } 

        const timeNow = new Date()
        if(!confirmationCode.createdAt) {
            return
        }
    
        if (timeNow > confirmationCode.expiry) {
            return response.conflict(res, {message: "Sorry, confirmation code has expired, please get a new code"})
        }

        const user = await findUser({ confirmationCode: confirmationCode._id }, 'organizationRoles.organization');
        if(!user) {
            return response.conflict(res, {message: "user not found"})
        }
       
        const userId = user._id;
        let updateQuery = body
        delete updateQuery.password
        delete updateQuery.confirmationCode
        delete updateQuery.stateToken
        delete updateQuery.type
        updateQuery.emailConfirmed = true
        updateQuery.userType = signupType
        // updateQuery.name = `${body.firstName}${body.middleName ? ` ${body.middleName} ` : ' '}${body.lastName}`
        updateQuery.signupComplete = true

        
        let organization: ProducerDocument | ExporterDocument | RegulatorDocument | InspectorDocument | null = null
        let organizationModel: 'Producer' | 'Exporter' | 'Regulator' | 'Inspector' | null = null
        
        if(signupType === 'producer') {
            organization = await createProducer({
                ...body.organization,
                contact: {
                    email: user.email,
                    phone: user.phone
                },
                primaryLocation: {
                    state: body.state,
                    lga: body.lga
                },
                createdBy: user._id
            })
            organizationModel = 'Producer'
        }
        
        if(signupType === 'exporter') {
            organization = await createExporter({ 
                ...body.organization,
                contact: {
                    email: user.email,
                    phone: user.phone
                },
                address: {
                    address: body.address,
                    state: body.state,
                    country: body.country,
                    countryCode: body.countryCode
                },
                createdBy: user._id
            })
            organizationModel = 'Exporter'
        }

        if(signupType === 'regulator') {
            const regulatorPayload = {
                ...body.organization,
                name: body.organization?.name || body.name,
                type: body.organization?.type || body.regulatorType,
                contactEmail: body.organization?.contactEmail || user.email,
                contactPhone: body.organization?.contactPhone || user.phone,
                state: body.organization?.state || body.state,
                country: body.organization?.country || body.country
            }

            if(!regulatorPayload.name || !regulatorPayload.type) {
                return response.badRequest(res, {message: 'regulator signup requires organization.name and organization.type'})
            }

            organization = await createRegulator(regulatorPayload as any)
            organizationModel = 'Regulator'
        }

        if(signupType === 'inspector') {
            const inspectorPayload = {
                ...body.organization,
                createdBy: user._id,
                organizationName: body.organization?.organizationName || body.organization?.name,
                organizationType: body.organization?.organizationType,
                type: body.organization?.type || body.inspectorType,
                areasOfOperation: body.organization?.areasOfOperation || [{ state: body.state, lga: body.lga }].filter((item) => item.state)
            }

            if(!inspectorPayload.organizationName || !inspectorPayload.organizationType || !inspectorPayload.type) {
                return response.badRequest(res, {message: 'inspector signup requires organization.organizationName, organization.organizationType and organization.type'})
            }

            organization = await createInspector(inspectorPayload as any)
            organizationModel = 'Inspector'
        }

        if(signupType !== 'producer' && signupType !== 'exporter' && signupType !== 'regulator' && signupType !== 'inspector') {
            return response.badRequest(res, {message: `organization setup for user type '${signupType}' is not yet supported`})
        }


        if(!organization) {
            return response.error(res, {message: 'sorry there was an error creating your organization'})
        }

        // get organization owner role
        const role = await findRole({slug: 'producer-business-owner'})
        if(!role){
            return response.notFound(res, {message: 'producer business owner role not found'})
        }
        
        updateQuery.organizationRoles = {
            organization: organization._id,
            organizationModel,
            roles: [role._id]
        }


        const updatedUser = await findAndUpdateUser({ _id: userId }, updateQuery, { new: true })

        await findAndUpdateConfirmation({ _id: confirmationCode._id }, { valid: false }, { new: true })

        if(!updatedUser) {
            return response.error(res, {message: 'sorry there was an error updating the user'})
        }

        sendEmailJob({
            action: 'welcome-email', 
            data: {
                mailTo: user.email,
                firstName: user.name.split(' ')[0],
                userType: signupType,
                organization: {
                    name: (organization as any).name || (organization as any).companyName || body.organization?.name || body.organization?.companyName || 'your organization'
                }
            }
        })

        sendEmailJob({
            action: 'admin-new-user-notification', 
            data: {
                mailTo: process.env.ADMIN_NOTIFICATION_RECIPIENT as string,
                userEmail: user.email,
                userName: user.name,
                userType: user.userType,
                organization: organization
            }
        })

        return response.ok(res, {
            message: 'profile completed successfully',
            // data: omit(updatedUser, ['_id', 'password', 'confirmationToken'])
        })
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function createUserHandler(req: Request, res: Response) {
    try {
        const userId = get(req, 'user._id');
        const existingUserByEmail = await findUser({ email: req.body.email })
        const existingUserByPhone = await findUser({ phone: req.body.phone })

        if (existingUserByEmail) {
            return response.conflict(res, {message: 'email already registered'})
        }

        if (existingUserByPhone) {
            return response.conflict(res, {message: 'phone number already registered'})
        }

        const input = req.body

        const user = await createUser(input)

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'create',
            description: `created user ${user.name}`,
            actor: userId,
            item: user._id,
            requestPayload: omit(input, ['password']),
            responseObject: omit(user.toJSON(), ['password'])
        }).catch((error) => {
            log.error('Failed to enqueue audit log for user creation', error);
        });

        return response.created(res, 
            omit(user.toJSON(), ['password'])
        )
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function getUserProfileHandler (req: Request, res: Response) {
    try {
        const userId = get(req, 'user._id');
        const queryObject: any = req.query;

        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const defaultExpand = ['organizationRoles.organization', 'organizationRoles.roles']
        const requestedExpand = Array.isArray(expand)
            ? expand
            : expand
                ? [expand]
                : []
        const populatePaths = [...new Set([...defaultExpand, ...requestedExpand])]

        let user = await findUser({_id: userId}, populatePaths)

        if(!user) {
            return response.notFound(res, {message: 'User not found'})
        }

        // const currentBusiness = user.businesses?.find((business: any) => business.business._id.toString() === req.currentBusiness._id.toString())
        
        // let userDetails = omit(user, ['password', 'confirmationToken'])

        // const permissions = currentBusiness?.roles.flatMap(
        //     (role: any) => role.permissions
        // );
        // let returnUser = omit(user, ['password', 'confirmationToken'])
        
        // if(req.currentBusiness) {
        //     const userStore = user.businesses?.find(store => store.business._id.toString() === req.currentBusiness._id.toString())       
        //     userDetails = {...userDetails, ...{storeRoles: userStore?.roles}}
        // }

        // delete userDetails.businesses
        delete user.adminRoles
        delete user.password
        delete user.confirmationCode
        return response.ok(res, user)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function getUserDetailsHandler (req: Request, res: Response) {
    try {
        const userId = get(req, 'params.userId');
        const queryObject: any = req.query;

        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const defaultExpand = ['organizationRoles.organization', 'organizationRoles.roles']
        const requestedExpand = Array.isArray(expand)
            ? expand
            : expand
                ? [expand]
                : []
        const populatePaths = [...new Set([...defaultExpand, ...requestedExpand])]

        const user = await findUser({_id: userId}, populatePaths)

        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        let returnUser = omit(user, ['password', 'confirmationToken'])
        
        // if(req.currentBusiness) {
        //     const userStore = user.businesses?.find(store => store.business._id.toString() === req.currentBusiness._id.toString())       
        //     returnUser = {...returnUser, ...{businessRoles: userStore?.roles}}
        //     delete returnUser.businesses

        // }

        return response.ok(res, returnUser)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export const checkExistingUserHandler = async (req: Request, res: Response) => {
    try {
        const field = get(req, 'params.field')
        const value = get(req, 'params.value')

        let user = await findUser({[field]: value})

        if(user && user !== null) {
            return response.conflict(res, {message: `${field} is already taken`})
        } else {
            return response.ok(res, {message: `${field} is available`})
        }
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function updateUserHandler (req: Request, res: Response) {
    try {
        // if(req.body.handle && req.body.handle !== '') {
        //     let user = await findUser({handle: req.body.handle})
        //     if(user) {
        //         return response.conflict(res, {message: `the handle ${req.body.handle} is already taken`})
        //     }
        // }

        const currentUser = get(req, 'user._id')
        const update = req.body
        const updatedUser = await findAndUpdateUser({ _id: currentUser }, update, { new: true })
        
        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'update',
            description: `updated own user profile`,
            actor: currentUser,
            item: currentUser,
            requestPayload: update,
            responseObject: omit(updatedUser, ['password'])
        }).catch((error) => {
            log.error('Failed to enqueue audit log for user update', error);
        });
        
        return response.ok(res, omit(updatedUser, ['password']))
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function deleteUserHandler (req: Request, res: Response) {
    try {
        const user = await findUser({_id: req.params.userId})
        const currentUser = get(req, 'user._id')
        if(!user) {
            return response.notFound(res, {message: `user not found`})
        }
        console.log(user._id)
        console.log(currentUser)

        if(user._id == currentUser) {
            return response.conflict(res, {message: 'you are not allowed to delete your own account'})
        }

        await deleteUser({_id: user._id})
        
        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'delete',
            description: `deleted user ${user.name}`,
            actor: currentUser,
            item: user._id,
            requestPayload: {userId: req.params.userId}
        }).catch((error) => {
            log.error('Failed to enqueue audit log for user deletion', error);
        });
        
        return response.ok(res, {message: 'User deleted successfully'})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

const checkUpdateObject = (update: any, currentUser: any) : { error: Boolean, message: string } => {
    if(update.userType && update.userType !== '' && currentUser.userType !== 'SUPER_ADMINISTRATOR') {
        return {error: true, message: "You are not allowed to update account type"}
    }else if(update.userCode && update.userCode !== '') {
        return {error: true, message: "You are not allowed to update user code"}
    }else if(update.emailConfirmed && currentUser.accountType !== 'SUPER_ADMINISTRATOR' ) {
        return {error: true, message: "You are not allowed to update confirmation status"}
    }else if(update.deactivated && currentUser.accountType !== 'SUPER_ADMINISTRATOR') {
        return {error: true, message: "You are not allowed to update active status"}
    }else if(update.devices) {
        return {error: true, message: "You are not allowed to update devices"}
    }else if(update.bvnValidationData) {
        return {error: true, message: "You are not allowed to update bvn data"}
    }else if(update.bvnValidated) {
        return {error: true, message: "You are not allowed to update bvn validation status"}
    } else {
        return {error: false, message: ''}
    }
}

export async function adminUpdateUserHandler (req: Request, res: Response) {
    try {
        const currentUser = get(req, 'user')
        const currentUserId = get(currentUser, '_id')
        const user = await findUser({_id: req.params.userId})
        const update = req.body;

        if(!user) {
            return response.notFound(res, {message: "User not found"})
        }

        if(user._id == currentUser) {
            return response.conflict(res, {message: 'you are not allowed to update your own account'})
        }

        const updateObjectCheck = checkUpdateObject(update, currentUser)
        if(updateObjectCheck.error) {
            return response.badRequest(res, {message: updateObjectCheck.message})
        }
    
        const updatedUser = await findAndUpdateUser({ _id: user._id }, update, { new: true })
        
        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'update',
            description: `admin updated user ${user.name}`,
            actor: currentUserId,
            item: user._id,
            requestPayload: update,
            responseObject: updatedUser
        }).catch((error) => {
            log.error('Failed to enqueue audit log for admin user update', error);
        });
        
        return response.ok(res, updatedUser)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function getUsersHandler (req: Request, res: Response) {
    try {
        const user = get(req, 'user._id')
        const currentUser = await findUser({_id: user})
        if(!currentUser) {
            return response.notFound(res, {message: 'user not found'})
        }
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 30; // results per page
        const page = +queryObject.page || 1; // Page 
        const filters = parseUserFilters(queryObject)

        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        
        const users = await findAllUsers({...filters, 
            // ...{'businesses.business': { $in: [req.currentBusiness?._id] } } 
        }, resPerPage, page, expand);
    
        const responseObject = {
            page,
            perPage: resPerPage,
            total: users.total,
            users: users.data
        }
        return response.ok(res, responseObject)
    } catch (error) {
        return response.error(res, error)
    }
}

export async function publicGetUsersHandler (req: Request, res: Response) {
    try {
        const user = get(req, 'user._id')
        const currentUser = await findUser({_id: user})
        if(!currentUser) {
            return response.notFound(res, {message: 'user not found'})
        }
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 30; // results per page
        const page = +queryObject.page || 1; // Page 
        const filters = parseUserFilters(queryObject)

        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        
        const users = await findAllUsers({...filters, 
            _id: { $ne: currentUser._id },
            userType: { $nin: ['super-administrator', 'admin'] }
        }, resPerPage, page, expand);

        const returnedUsers = users.data.map((user) => {
            const userObject = omit(user, ['password', 'confirmationCode', 'emailConfirmed', 'signupComplete', '_id', 'createdAt', 'updatedAt', '__v', 'idNumber', 'email', 'phone', 'adminRoles', 'permissions', 'organizationRoles.roles', 'organizationRoles.organizationModel'])
            return userObject
        })
    
        const responseObject = {
            page,
            perPage: resPerPage,
            total: users.total,
            users: returnedUsers
        }
        return response.ok(res, responseObject)
    } catch (error) {
        return response.error(res, error)
    }
}

export async function changePasswordHandler(req: Request, res: Response) {
    try {
        const password= req.body.password
        const newPassword = req.body.newPassword
        const userId = get(req, 'user._id');

        const user = await findUser({_id: userId}) 

        if(!user) {
            return response.notFound(res, 'user not found')
        }
        // const user = await findUser({_id: userId})
        
        const validated = await validatePassword({email: user.email, password});
        if (!validated) {
            return response.unAuthorized(res, { message: "invalid email or password" })
        }

        await changePassword(mongoose.Types.ObjectId((user._id)), newPassword)
        return response.ok(res, {message: 'Password updated successfully'})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function bulkImportUsers(req: Request, res: Response) {
    try {

        let created = 0
        await Promise.all(req.body.data.map(async (item: any) => {
            await createUser({
                email: item.email,
                username: item.username,
                name: item.name,
                phone: item.phone,
                idNumber:item.idNumber,
                permissions: item.permissions,
                password: atob(item.password),
                passwordChanged: item.document.passwordChanged,
                userType: 'ADMIN'
            })
            created += 1
        }))

        return response.ok(res, {message: `${created} users created successfully.`}) 
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function resetUserPassword(req: Request, res: Response) {
    try {
        const user = await findUser({_id: req.params.user})
        if(!user) {
            return response.notFound(res, 'user not found')
        }
        const body = req.body
        let updated = 0

        await changePassword(user._id, 'Abcd1234!')
        
        await findAndUpdateUser({_id: user._id}, {passwordChanged: false}, {new: true})

        return response.ok(res, {message: `${updated} user password has been reset successfully. Use Abcd1234! for first log in`}) 
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function bulkResetPasswords(req: Request, res: Response) {
    try {
        const users = await findAllUsers({}, 10000, 1)
        const body = req.body
        let updated = 0
        await Promise.all(users.data.map(async (item: any) => {
            // 
            await changePassword(item._id, body.password)
            await findAndUpdateUser({_id: item._id}, {passwordChanged: false}, {new: true})
            updated += 1
        }))

        return response.ok(res, {message: `${updated} user passwords reset successfully. Use ${body.password} for first log in`}) 
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

