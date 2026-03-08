import { object, string, ref, array, number } from "yup";

export const createSubscriptionSchema = object({
    body: object({
        business: string().required('store is required'),
        subscriptionPlan: string().required('subscriptionPlan is required'),
        days: number().required('price is required')           
    })
});

const params = {
    params: object({
        subscriptionId: string().required('subscription plan id is required as a path param')
    })
}

export const getSubscriptionSchema = object({
    ...params
})