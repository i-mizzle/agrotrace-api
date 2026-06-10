import mongoose from "mongoose";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";
import { productTypes } from "../static/product-types";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface ProductDocument extends mongoose.Document {
    code: string;
    type: string;
    expiry: Date
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true
        },
        category: {
            type: String,
            enum: productTypes.map(type => type.category),
            required: true
        },
        type: {
            type: String,
            enum: productTypes.flatMap(type => type.types),
            required: true
        },
        wholeBatch: {
            type: Boolean,
            default: false
        },
        quantity: {
            amount: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                enum: ['kg', 'tons', 'head', 'cartons', 'bags']
            }
        },
        processingMethod: {
            type: String
        },
        yieldPercentage: {
            type: Number
        },
        storageCondition: {
            type: String
        },
        packingType: {
            type: String
        },
        labelCode: {
            type: String
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }

    },
    { 
        timestamps: true 
    }
);

applyPublicIdPlugin(ProductSchema);

const Product = mongoose.model<ProductDocument>("Product", ProductSchema);

export default Product;