import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import { createCategory, findAndUpdateCategory, findCategories, findCategory } from "../service/category.service";

const parseCategoryFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, type, name } = query; 

    const filters: any = {}; 

    if (name) {
        filters.name = { $regex: name, $options: "i" }; 
    }
    
    if (type) {
        filters.type = type
    }

    if (minDateCreated && !maxDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated && !minDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }

    if (minDateCreated && maxDateCreated) {
        filters.date = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    }
  
    return filters
}

export const createCategoryHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        let body = req.body

        const category = await createCategory({...body, ...{createdBy: userId }})
        
        return response.created(res, category)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getCategoriesHandler = async (req: Request, res: Response) => {
    try {
        const businessId = get(req, 'params.businessId');
        const queryObject: any = req.query;
        const filters = parseCategoryFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand ||  null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const categories = await findCategories( {...filters, ...{ deleted: false, business: businessId }}, 0, 0, expand)
        // return res.send(post)

        // const categoriesWithItemsCount: any = await Promise.all(categories.categories.map(async (category) => {
        //     const items = await findItems({_id: category._id}, 0, 0, '')
        //     return {...category, itemCount: items.total}
        // }))

        const responseObject = {
            total: categories.total,
            categories: categories
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

// export const getMenuHandler = async (req: Request, res: Response) => {
//     try {
//         const menuId = get(req, 'params.menuId');
//         const queryObject: any = req.query;
//         let expand = queryObject.expand || null

//         if(expand && expand.includes(',')) {
//             expand = expand.split(',')
//         }

//         const menu = await findMenu({ _id: menuId, deleted: false }, expand)

//         if(!menu) {
//             return response.notFound(res, {message: 'menu not found'})
//         }

//         return response.ok(res, menu)
        
//     } catch (error:any) {
//         return response.error(res, error)
//     }
// }

export const updateCategoryHandler = async (req: Request, res: Response) => {
    try {
        const categoryId = get(req, 'params.categoryId');
        const userId = get(req, 'user._id');
        let update = req.body

        const item = await findCategory({_id: categoryId})
        if(!item) {
            return response.notFound(res, {message: 'category not found'})
        }

        await findAndUpdateCategory({_id: item._id}, update, {new: true})

        return response.ok(res, {message: 'category updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteCategoryHandler = async (req: Request, res: Response) => {
    try {
        const menuId = get(req, 'params.categoryId');
        const userId = get(req, 'user._id')
        const menu = await findCategory({_id: menuId})
        if(!menu) {
            return response.notFound(res, {message: 'category not found'})
        }

        await findAndUpdateCategory({_id: menu._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'category deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
