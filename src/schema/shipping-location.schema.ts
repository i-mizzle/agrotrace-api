import { object, string, ref, number, boolean, array } from "yup";

export const createShippingLocationSchema = object({
    body: object({
        createdBy: string().required('createdBy is required'),
        location: string().required('location is required'),
        price: number().required('price is required')
    })
});

const params = {
    params: object({
        locationId: string().required('location id is required as a path param')
    })
}

export const getMenuSchema = object({
    ...params
})
