import { object, string, ref, number, boolean, array } from "yup";

export const createTableSchema = object({
    body: object({
        name: string().required('name is required'),
        code: string().required('code is required'),
        description: string(),
        menu: string().required('menu is required'),
    })
});


export const bulkCreateTableSchema = object({
    body: object({
        quantity: number().required('quantity is required'),
        name: string().required('name is required'),
        code: string().required('code is required'),
        description: string(),
        menu: string().required('menu is required'),
    })
});


// name: string;
//     code: string;
//     business: BusinessDocument["_id"]
//     description: string;
//     deleted: boolean;
//     menu: boolean;
//     tableQrCode?: string;
//     tableUrl: string;
//     createdBy: UserDocument["_id"]
//     createdAt?: Date;
//     updatedAt?: Date;

const params = {
    params: object({
        tableId: string().required('Table id is required as a path param')
    })
}

export const getTableSchema = object({
    ...params
})
