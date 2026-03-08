import { object, string, number } from "yup";

export const createMenuSchema = object({
    body: object({
        rating: number().required('rating is required'),
        item: string().required('item is required'),
        review: string().required('review is required'),
        clientId: string(),
        source: string().required('source is required'),
        createdBy: object({
            name: string(),
            email: string()
        })
    })
});

const params = {
    params: object({
        reviewId: string().required('review id is required as a path param')
    })
}

export const getReviewSchema = object({
    ...params
})
