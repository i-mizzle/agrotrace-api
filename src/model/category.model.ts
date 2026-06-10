import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface CategoryDocument extends mongoose.Document {
    createdBy?: UserDocument['_id'];
    // business: BusinessDocument['_id']
    name: string;
    description: string;
    coverImage: string;
    featured: boolean;
    type: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CategorySchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        },
        // business: {
        //     type: mongoose.Schema.Types.ObjectId, 
        //     ref: 'Business',
        //     required: true
        // },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        coverImage: {
            type: String
        },
        featured: {
            type: Boolean,
            default: false
        },
        deleted: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: ['store', 'sale'],
            default: 'sale'
        }
    },
    { timestamps: true }
);

applyPublicIdPlugin(CategorySchema);

const Category = mongoose.model<CategoryDocument>('Category', CategorySchema);

export default Category;