import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";

export interface QrTraceDocument extends mongoose.Document {
    user: UserDocument['_id'];
    resetCode: ConfirmationCodeDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const QrTraceSchema = new mongoose.Schema(
  {
    referenceType: {
        type: String,
        enum: ['shipment', 'product', 'batch'],
        required: true
    },
    referenceItem: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    publicToken: {
        type: String,
        unique: true,
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

const QrTrace = mongoose.model<QrTraceDocument>("QrTrace", QrTraceSchema);

export default QrTrace;