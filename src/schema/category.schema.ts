import { object, string, ref, number, boolean, array } from "yup";

export const createCategorySchema = object({
    body: object({
        createdBy: string().required('createdBy is required'),
        name: string().required('name is required'),
        description: string(),
        type: string().required('type is required'),
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
