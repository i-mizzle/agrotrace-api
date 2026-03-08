import { object, string, ref, number, boolean, array } from "yup";

export const createEnquirySchema = object({
    body: object({
        name: string().required('name is required'),
        email: string().required('your email address is required'),
        phone: string(),
        enquiry: string().required('your enquiry is required'),
    })
});

const params = {
    params: object({
        menuId: string().required('menu id is required as a path param')
    })
}

export const getEnquirySchema = object({
    ...params
})
