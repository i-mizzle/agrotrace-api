import { object, string, array, number } from "yup";

export const createSubscriptionPlanSchema = object({
    body: object({
        name: string().required('name is required'),
        description: string().required('description is required').max(100),
        cta: string().required('cta is required').max(45),
        thresholds: object({
            users: number().required('thresholds.users is required'),
            items: number().required('thresholds.items'),
            transactionsPerMonth: number().required('thresholds.transactionsPerMonth is required'),
            locations: number().required('thresholds.locations is required')
        }),
        features: array(string()),
        featuresDisplay: array(string()).required('featuresDisplay is required'),
        price: number().required('price is required')           
    })
});

const params = {
    params: object({
        subscriptionPlanId: string().required('subscription plan id is required as a path param')
    })
}

export const getSubscriptionPlanSchema = object({
    ...params
})