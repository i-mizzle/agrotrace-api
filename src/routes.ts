import { 
    Express,
    Request,
    Response 
} from 'express';
import { checkUserType, requiresUser, validateRequest } from './middleware';
import requiresAdministrator from './middleware/requiresAdministrator';
import { changePasswordSchema, completeSignupSchema, createUserSchema, createUserSessionSchema, getUserDetailsSchema } from './schema/user.schema';
import { adminUpdateUserHandler, changePasswordHandler, completeSignupHandler, confirmEmailHandler, createUserHandler, deleteUserHandler, getAllUsersHandler, getUserDetailsHandler, getUserProfileHandler, resendEmailConfirmationHandler, resetUserPassword, signupHandler, updateUserHandler } from './controller/user.controller';
import { createUserSessionHandler, invalidateUserSessionHandler } from './controller/session.controller';
import requiresPermissions from './middleware/requiresPermissions';
import { rejectForbiddenUserFields } from './middleware/rejectForbiddenUserFields';
import { upload } from './service/integrations/cloudinary.service';
import { newFileHandler, newFilesHandler } from './controller/file.controller';
import { createCategoryHandler, deleteCategoryHandler, getCategoriesHandler } from './controller/category.controller';
import { confirmationSchema, resendConfirmationSchema } from './schema/confirmation-code.schema';
import { getPermissionsHandler } from './controller/permission.controller';
import { createRoleHandler, getRoleHandler, getRolesHandler, updateRoleHandler } from './controller/role.controller';
import { requestPasswordResetHandler, resetPasswordHandler } from './controller/password-reset.controller';
import { resetPasswordSchema, resetRequestSchema } from './schema/password-reset.schema';

// import { checkoutHandler } from './controller/checkout.controller'; // Commented out - missing service dependencies
import { listBanksHandler, validateAccountNumberHandler } from './controller/utility.controller';
import { createLocationHandler, deleteLocationHandler, getLocationHandler, getLocationsHandler, updateLocationHandler } from './controller/location.controller';
import { createLocationSchema } from './schema/location.schema';
import { createAssetHandler, deleteAssetHandler, getAssetHandler, getAssetsHandler, updateAssetHandler } from './controller/asset.controller';
import { createAssetSchema } from './schema/asset.schema';

export default function(app: Express) {
    app.get('/ping', (req: Request, res: Response) => res.sendStatus(200))

    app.get("/utilities/banks",
        requiresUser,
        listBanksHandler
    )

    app.post("/utilities/validate-account",
        requiresUser,
        validateAccountNumberHandler
    )

    app.post('/onboarding/signup', 
        checkUserType,
        validateRequest(createUserSchema), 
        signupHandler
    )
    
        // Confirm email
    app.post('/onboarding/email-confirmation/resend', 
        validateRequest(resendConfirmationSchema), 
        resendEmailConfirmationHandler
    )

    // Confirm email
    app.post('/onboarding/signup/confirm', 
        validateRequest(confirmationSchema),
        confirmEmailHandler
    )

    // signup user
    app.post('/onboarding/signup/complete', 
        validateRequest(completeSignupSchema), 
        completeSignupHandler
    )

    app.post('/reset-password/:user', 
        requiresUser,
        requiresAdministrator,
        resetUserPassword
    )

    app.post('/auth/sessions', 
        validateRequest(createUserSessionSchema), 
        createUserSessionHandler
    )

//     // Get user sessions
//     app.get('/auth/sessions', 
//         requiresUser, 
//         getUserSessionsHandler
//     )

    // logout
    app.delete('/auth/sessions', 
        requiresUser, 
        invalidateUserSessionHandler
    )

    // confi

//     // Get user sessions
//     app.get('/user/sessions', 
//         requiresUser, 
//         getUserSessionsHandler
//     )

//     // Get user profile
    app.get('/user/profile', 
        requiresUser, 
        getUserProfileHandler
    )

    // Update user profile
    app.patch('/user/profile', 
        requiresUser, 
        rejectForbiddenUserFields, 
        updateUserHandler
    )

    // Update user profile
    app.patch('/user/profile/:userId', 
        requiresUser, 
        requiresPermissions(['*', 'business.*', 'business.users.*', 'business.users.update']),
        validateRequest(getUserDetailsSchema),
        adminUpdateUserHandler
    )

    /**
     * Locations Routes
     */

    app.post('/locations',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.locations.*', 'producer.locations.create']),
        validateRequest(createLocationSchema), 
        createLocationHandler
    )

    app.get('/locations',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.locations.*', 'producer.locations.read']),
        getLocationsHandler
    )

    app.get('/locations/:locationId',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.locations.*', 'producer.locations.read']),
        getLocationHandler
    )

    app.patch('/locations/:locationId',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.locations.*', 'producer.locations.update']),
        updateLocationHandler
    )

    app.delete('/locations/:locationId',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.locations.*', 'producer.locations.update']),
        deleteLocationHandler
    )

    /**
     * Assets Routes
     */ 

    app.post('/assets',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.assets.*', 'producer.assets.create']),
        validateRequest(createAssetSchema), 
        createAssetHandler
    )

    app.get('/assets',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.assets.*', 'producer.assets.read']),
        getAssetsHandler
    )

    app.get('/assets/:assetId',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.assets.*', 'producer.assets.read']),
        getAssetHandler
    )

    app.patch('/assets/:assetId',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.assets.*', 'producer.assets.update']),
        updateAssetHandler
    )

    app.delete('/assets/:assetId',
        requiresUser,
        requiresPermissions(['*', 'producer.*', 'producer.assets.*', 'producer.assets.delete']),
        deleteAssetHandler
    )

    //  Get all users 
    app.post('/users/create-user', 
        // checkUserType,
        requiresUser,
        requiresPermissions(['*', 'business.*', 'business.users.*', 'business.users.create']),
        validateRequest(createUserSchema), 
        createUserHandler
    )

    app.get('/users/all', 
        requiresUser, 
        requiresPermissions(['*', 'business.*', 'business.users.*', 'business.users.read']),
        getAllUsersHandler
    )

//  Get user account details by admin
    app.get('/users/profile/:userId', 
        requiresUser, 
        requiresPermissions(['*', 'business.*', 'business.users.*', 'business.users.read']),
        validateRequest(getUserDetailsSchema),
        getUserDetailsHandler
    )

//     Delete user account
    app.delete('/users/delete/:userId', 
        requiresUser, 
        requiresAdministrator,
        requiresPermissions(['can_manage_users']),
        validateRequest(getUserDetailsSchema),
        deleteUserHandler
    )

    app.post('/auth/password-reset/request', 
        validateRequest(resetRequestSchema),
        requestPasswordResetHandler
    )

    app.post('/auth/password-reset', 
        validateRequest(resetPasswordSchema),
        resetPasswordHandler
    )

    app.post('/user/change-password', 
        requiresUser,
        validateRequest(changePasswordSchema),
        changePasswordHandler
    )

   
    // Categories
    // create category
    app.post('/categories',
        requiresUser,
        requiresPermissions(['*', 'business.*', 'business.item-categories.*', 'business.item-categories.create']),
        createCategoryHandler
    )
    
    // get all categories
    app.get('/categories/:businessId',
        // requiresUser,
        // requiresAdministrator,
        // requiresPermissions(['can_manage_items']),
        getCategoriesHandler
    )

    // get all categories
    app.delete('/categories/:categoryId', 
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        deleteCategoryHandler
    )
    
     app.delete('/tables/:tableId',
        requiresUser,
        requiresPermissions(['*', 'business.*', 'business.tables.*', 'business.tables.delete'])
    )

     // Permissions
    app.get('/permissions', 
        requiresUser,
        getPermissionsHandler
    )

    // Roles
    app.post('/roles', 
        requiresUser,
        createRoleHandler
    )

    app.get('/roles', 
        requiresUser,
        getRolesHandler
    )

    app.get('/roles/:roleId', 
        requiresUser,
        getRoleHandler
    )

    app.patch('/roles/:roleId', 
        requiresUser,
        updateRoleHandler
    )

    // UPLOAD FILE
    app.post("/files/new", 
        requiresUser,
        upload.single("file"),
        newFileHandler
    )
    
    // UPLOAD MULTIPLE FILES
    app.post("/files/new/multiple", 
        requiresUser,
        upload.array("files", 10),
        newFilesHandler
    )


}


