import { object, string, ref, number, array } from "yup";

export const createItemSchema = object({
    body: object({
        createdBy: string().required('createdBy is required'),
        // sku: string().when('type', {
        //     is: 'sale', 
        //     then: string().required('sku is required for sale items')
        // }),
        // sku: string().required('sku is required'),
        name: string().required('name is required'),
        // category:  string().when('type', {
        //     is: 'sale', 
        //     then: string().required('category is required for sale items')
        // }),
        description: string(),
        lowStockAlertCount: number().required('lowStockAlertCount is required'),
        type: string().required('type is required as sale or store'),
        stockUnit: string().required('stockUnit is required'),
        coverImage: string().matches(
            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
            'Please use a valid url for coverImage'),
        // state: string().required('phone number (phone) is required'),  
        variants: array( object({
            name: string().required('variant name is required'),
            barcode: string(),
            sku: string().required('variant sku is required'),
            description: string(),
            saleUnit: string().required('variant saleUnit is required'),
            recipe: array(object({
                item: string().required('variant recipe item is required'),
                measure: number().required('variant recipe measure is required')
            }))
        })).when('type', {
            is: 'sale', 
            then: string().required('an array of variants is required for sale items').min(1, 'provide at least one variant for this item')
        })        
    })
});

const params = {
    params: object({
        itemId: string().required('item id is required as a path param')
    })
}

export const getItemSchema = object({
    ...params
})

// createdBy: UserDocument['_id'];
//     name: string;
//     sku: string;
//     description: string;
//     saleUnit: string;
//     type: string;
//     recipe: Recipe[]