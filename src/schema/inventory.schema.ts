import { object, string, ref, number, boolean, array } from "yup";

export const updateInventorySchema = object({
    body: object({
        // recordedBy: string().required('recordedBy is required'),
        variant: string(),
        item: string(),
        note: string().required('stock change note is required'),
        type: string().required('type is required'),
        quantity: number().required('type is required'),
    })
});

// const params = {
//     params: object({
//         menuId: string().required('menu id is required as a path param')
//     })
// }

// export const getMenuSchema = object({
//     ...params
// })

