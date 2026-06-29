import mongoose from "mongoose";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
import { ProducerDocument } from "./producer.model";

export interface QrTraceDocument extends mongoose.Document {
    id?: string;
    referenceType: 'asset' | 'shipment' | 'product' | 'batch';
    referenceItem: mongoose.Types.ObjectId;
    producer: ProducerDocument["_id"];
    traceUrl?: string;
    qrCode?: string;
    deleted?: boolean
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
    producer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Producer",
        required: true 
    },
    traceUrl: {
        type: String
    },
    qrCode: {
        type: String,
    }
  },
  { timestamps: true }
);

applyPublicIdPlugin(QrTraceSchema);

const QrTrace = mongoose.model<QrTraceDocument>("QrTrace", QrTraceSchema);

export default QrTrace;