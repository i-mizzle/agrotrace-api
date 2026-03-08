import { 
    Express,
    Request,
    Response 
} from 'express';
import { requiresUser, validateRequest } from './middleware';
import requiresAdministrator from './middleware/requiresAdministrator';
import { changePasswordSchema, createUserSchema, createUserSessionSchema, getUserDetailsSchema } from './schema/user.schema';
import { adminUpdateUserHandler, changePasswordHandler, confirmEmailHandler, createUserHandler, deleteUserHandler, getAllUsersHandler, getUserDetailsHandler, getUserProfileHandler, resendEmailConfirmationHandler, resetUserPassword, signupHandler, updateUserHandler } from './controller/user.controller';
import { createUserSessionHandler, invalidateUserSessionHandler } from './controller/session.controller';
import requiresPermissions from './middleware/requiresPermissions';
import { rejectForbiddenUserFields } from './middleware/rejectForbiddenUserFields';
import { upload } from './service/integrations/cloudinary.service';
import { newFileHandler, newFilesHandler } from './controller/file.controller';
import { createCategoryHandler, deleteCategoryHandler, getCategoriesHandler } from './controller/category.controller';
import { createMenuSchema } from './schema/menu.schema';
import { createOrderSchema } from './schema/order.schema';
import { confirmationSchema, resendConfirmationSchema } from './schema/confirmation-code.schema';
import { getPermissionsHandler } from './controller/permission.controller';
import { createRoleHandler, getRoleHandler, getRolesHandler, updateRoleHandler } from './controller/role.controller';
import { createSubscriptionPlanSchema, getSubscriptionPlanSchema } from './schema/subscription-plan.schema';
import { requestPasswordResetHandler, resetPasswordHandler } from './controller/password-reset.controller';
import { resetPasswordSchema, resetRequestSchema } from './schema/password-reset.schema';
import { createBusinessSchema, getBusinessSchema } from './schema/business.schema';
import { bulkCreateTableSchema, createTableSchema, getTableSchema } from './schema/table.schema';
import { checkoutCartSchema, deductFromCartSchema, sendToCartSchema } from './schema/cart.schema';
// import { checkoutHandler } from './controller/checkout.controller'; // Commented out - missing service dependencies
import { listBanksHandler, validateAccountNumberHandler } from './controller/utility.controller';

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
        // checkUserType,
        validateRequest(createUserSchema), 
        signupHandler
    )
    
        // Confirm email
    app.post('/onboarding/email-confirmation/resend', 
        validateRequest(resendConfirmationSchema), 
        resendEmailConfirmationHandler
    )

    // Confirm email
    app.post('/onboarding/email-confirmation', 
        validateRequest(confirmationSchema),
        confirmEmailHandler
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


