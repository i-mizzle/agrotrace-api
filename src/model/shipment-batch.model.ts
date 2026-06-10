import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface ShipmentBatchDocument extends mongoose.Document {
    user: UserDocument['_id'];
    resetCode: ConfirmationCodeDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const ShipmentBatchSchema = new mongoose.Schema(
  {
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    batch: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Batch", 
        required: true
    },
    quantity: {
        amount: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['kg', 'tons', 'head', 'cartons', 'bags'],
            required: true
        }
    }
  },
  { timestamps: true, collection: 'shipmentbatches' }
);

applyPublicIdPlugin(ShipmentBatchSchema);

const ShipmentBatch = mongoose.model<ShipmentBatchDocument>("ShipmentBatch", ShipmentBatchSchema);

export default ShipmentBatch;