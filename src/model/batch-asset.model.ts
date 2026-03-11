import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";

export interface BatchAssetDocument extends mongoose.Document {
    user: UserDocument['_id'];
    resetCode: ConfirmationCodeDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const BatchAssetSchema = new mongoose.Schema(
  {
    batch: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Batch",
        required: true 
    },
    asset: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Asset",
        required: true 
    },
    contribution:{
        quantity: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['kg', 'tons', 'head', 'cartons', 'bags'],
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    }
  },
  { timestamps: true }
);

const BatchAsset = mongoose.model<BatchAssetDocument>("BatchAsset", BatchAssetSchema);

export default BatchAsset;