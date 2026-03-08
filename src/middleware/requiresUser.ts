import { get } from 'lodash'
import { Request, Response, NextFunction, request } from 'express'
import * as response from "../responses/index";
import { findSession } from '../service/session.service';
import { DocumentDefinition } from 'mongoose';
import { findUser } from '../service/user.service';

declare global {
    namespace Express {
        interface Request {
            // currentBusiness: DocumentDefinition<BusinessDocument>;
            permissions: string[];
            // storeSubscription?: DocumentDefinition<SubscriptionDocument>
        }
    }
}

const requiresUser = async (req: Request, res: Response, next: NextFunction) => {
    const user = get(req, 'user');

    if (!user || user['exp'] < (new Date()).getTime()/1000) {
        return response.forbidden(res, { message: 'Sorry, you must be logged in to access this resource', code: 'expired-token' })
    }

    const userDetails = await findUser({_id: user['_id']}, 'businesses.roles')

    const session = await findSession({_id: user['session']})

    if(!req.businessSubdomain && userDetails!.userType === 'user'){
        return response.badRequest(res, { message: 'Sorry, you must be in the context of the store to access this resource' })
    }

    // const currentStore = await findBusiness({subdomain: req.businessSubdomain})
    // if(!currentStore && userDetails?.userType === 'user'){
    //     return response.notFound(res, {message: 'store not found'})
    // }

    // if(currentStore){
    //     req.currentBusiness = currentStore
    //     // const subscription = await findSubscription({business: currentStore._id, active: true}, 'subscriptionPlan')
    //     // req.storeSubscription = subscription || undefined
    // }
    // console.log(userDetails!.businesses)

    // if(userDetails && userDetails.userType === 'user' && userDetails.businesses) {
    //     const userStore = userDetails.businesses.find(store => store.business.toString() === currentStore?._id.toString())
    //     if(!userStore) {
    //         return response.forbidden(res, {message: 'Sorry, you do not have access to this store'})
    //     }

    //     req.permissions = userStore.roles.flatMap(
    //         (role: any) => role.permissions
    //     );
    // }

    if(!session || session.valid === false) {
        return response.unAuthorized(res, { message: 'Sorry, your session is invalid, please log in again' })
    }

    // if(session.business && currentStore?._id.toString() !== session.business.toString()) {
    //     return response.forbidden(res, { message: 'Sorry, you are not logged in to the current store' })
    // }


    return next();
}

export default requiresUser