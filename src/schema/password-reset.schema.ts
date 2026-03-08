import { object, string, ref, array } from "yup";

const requestResetPayload = {
    body: object({
        username: string().required('email is required')
    })
}

const resetPasswordPayload = {
    body: object({
        resetCode: string().required('resetCode is required'),
        password: string().required('password is required'),
    })
}

const changePasswordPayload = {
    body: object({
        password: string().required('password is required'),
        newPassword: string().required('newPassword is required'),
    })
}

export const resetRequestSchema = object({
   ...requestResetPayload
});

export const resetPasswordSchema = object({
   ...resetPasswordPayload
});

export const changePasswordSchema = object({
   ...changePasswordPayload
});
