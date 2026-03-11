import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Product, { ProductDocument } from '../model/product.model';

export async function createProduct(input: DocumentDefinition<ProductDocument>) {
    return Product.create(input);
}

export async function findProducts(
    query: FilterQuery<ProductDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Product.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Product.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Product.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findProduct(
    query: FilterQuery<ProductDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Product.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateProduct(
    query: FilterQuery<ProductDocument>,
    update: UpdateQuery<ProductDocument>,
    options: QueryOptions
) {
    return Product.findOneAndUpdate(query, update, options);
}

export async function deleteProduct(query: FilterQuery<ProductDocument>) {
    return Product.deleteOne(query);
}