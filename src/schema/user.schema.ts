import { object, string, ref } from "yup";

const changePasswordPayload = {
    body: object({
        password: string().required('password is required'),
        newPassword: string().required('newPassword is required'),
    })
}

export const changePasswordSchema = object({
    ...changePasswordPayload
 });


export const createUserSchema = object({
    body: object({
        name: string().required('name is required'),
        password: string()
            .required('password is required'),
            // .min(6, 'password is too short - should be 6 chars min'),
            // .matches(/^[a-zA-Z0-9_.-]*$/, 'password can only contain latin characters'),
        phone: string().required('phone is required'),
        username: string().required('username is required'),
        // userType: string().required('userType is required'),
        email: string()
            .email('must be a valid email')
            .required('email is required'),
            
    })
});

export const createUserSessionSchema = object({
    body: object({
        password: string()
            .required('password is required'),
            // .min(6, 'password is too short - should be 6 chars min'),
            // .matches(/^[a-zA-Z0-9_.-]*$/, 'password can only contain latin characters'),
        username: string()
        .required('username is required')        
    })
});

const params = {
    params: object({
        userId: string().required('user id is required')
    })
}

export const getUserDetailsSchema = object({
    ...params
})


// .when('eventType', {
//     is: 'VERSUS', 
//     then: object({
//         name: string().required('away side name is required'),
//     })
// }),
