import { object, string, ref } from "yup";

export const createBusinessSchema = object({
    body: object({
        createdBy: string().required('createdBy is required'),
        name: string().required('name is required'),
        address: string().required('address is required'),
        phone: string().required('address is required'),
        email: string().required('contact email is required'),
        city: string().required('city is required'),
        state: string().required('phone number (phone) is required'),           
        subdomain: string().required('subdomain is required'),           
        subscriptionPlan: string().required('subscriptionPlan is required'),           
    })
});

const params = {
    params: object({
        businessId: string().required('business id is required as a path param')
    })
}

export const getBusinessSchema = object({
    ...params
})