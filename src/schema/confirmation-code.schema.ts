import { object, string } from "yup";

const params = {
    params: object({
        confirmationCode: string().required('confirmation code is required')
    })
}


export const resendConfirmationSchema = object({
    body: object({
        email: string().required('email is required')
    })
});

// export const confirmationSchema = object({
//     ...params
// })

export const confirmationSchema = object({
    body: object({
        confirmationCode: string().required('confirmation code is required')
    })
})