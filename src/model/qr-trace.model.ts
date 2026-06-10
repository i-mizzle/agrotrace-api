import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
import { ProducerDocument } from "./producer.model";

export interface QrTraceDocument extends mongoose.Document {
    referenceType: 'asset' | 'shipment' | 'product' | 'batch';
    referenceItem: mongoose.Types.ObjectId;
    id: string;
    producer: ProducerDocument["_id"];
    createdAt?: Date;
    updatedAt?: Date;
}

const QrTraceSchema = new mongoose.Schema(
  {
    referenceType: {
        type: String,
        enum: ['asset', 'shipment', 'product', 'batch'],
        required: true
    },
    referenceItem: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    id: {
        type: String,
        unique: true,
        index: true,
        immutable: true,
        required: true
    },
    producer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Producer",
        required: true 
    }
  },
  { timestamps: true }
);

applyPublicIdPlugin(QrTraceSchema);

const QrTrace = mongoose.model<QrTraceDocument>("QrTrace", QrTraceSchema);

export default QrTrace;