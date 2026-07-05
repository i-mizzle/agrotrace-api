import mongoose from "mongoose";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";
import { productTypes } from "../static/product-types";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface ProductDocument extends mongoose.Document {
    batch?: mongoose.Schema.Types.ObjectId;
    category: string;
    type: string;
    sourceAsset: mongoose.Schema.Types.ObjectId;
    sourceEvent?: mongoose.Schema.Types.ObjectId;
    wholeBatch: boolean;
    quantity: {
        amount: number;
        unit: string;
    };
    processingMethod?: string;
    yieldPercentage?: number;
    storageCondition?: string;
    packingType?: string;
    labelCode?: string;
    createdBy: UserDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
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
        sourceAsset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Asset',
            required: true
        },
        sourceEvent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
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
                enum: ['kg', 'tons', 'head', 'cartons', 'bags', 'bottles', 'litres', 'gallons', 'pieces'],
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