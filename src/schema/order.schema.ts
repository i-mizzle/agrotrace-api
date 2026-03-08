import { object, string, ref, number, boolean, array } from "yup";

export const createOrderSchema = object({
    body: object({
        createdBy: string(),
        orderAlias: string(),
        source: string().required('source is required'),
        status: string().required('status is required'),
        paymentStatus: string().required('paymentStatus is required'),
        cart: string().when('source', {
            is: 'ONLINE', 
            then: string().required('cart id is required for online orders')
        }),
        items: array(object({
            item: string().required('items.item is required'),
            displayName: string(),
            price: number().required('item.price is required')
        })).when('source', {
            is: 'ONSITE', 
            then: array().required('an array of items is required for onsite orders')
        }),
        deliveryAddress: object({
            address: string(),
            // .required('deliveryAddress.address is required'),
            city: string(),
            // .required('deliveryAddress.city is required'),
            state: string()
            // .required('deliveryAddress.state is required')
        }).when('deliveryType', {
            is: 'DOORSTEP', 
            then: object().required('delivery address is required for online doorstep deliveries')
        }),
        deliveryType: string(),
        pickupOutlet: string().when('deliveryType', {
            is: 'PICKUP', 
            then: object().required('pickupOutlet is required for pickup orders')
        }),
        paymentMethod: string().when('source', {
            is: 'ONLINE', 
            then: object().required('paymentMethod is required for online orders')
        }),
    })
});

const params = {
    params: object({
        categoryId: string().required('category id is required as a path param')
    })
}

export const getCategorySchema = object({
    ...params
})
