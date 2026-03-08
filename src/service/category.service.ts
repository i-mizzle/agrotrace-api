import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Category, { CategoryDocument } from '../model/category.model';

export async function createCategory (input: DocumentDefinition<CategoryDocument>) {
    return Category.create(input)
}

export async function findCategories(
    query: FilterQuery<CategoryDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Category.find(query, {}, options).countDocuments()
    let categories = null
    if(perPage===0&&page===0){
        categories = await Category.find(query, {}, options).populate(expand)
    } else {
        categories = await Category.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        categories 
    }
}

export async function findCategory(
    query: FilterQuery<CategoryDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return Category.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdateCategory(
    query: FilterQuery<CategoryDocument>,
    update: UpdateQuery<CategoryDocument>,
    options: QueryOptions
) {
    return Category.findOneAndUpdate(query, update, options)
}