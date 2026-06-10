import mongoose from "mongoose";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface InspectionDocument extends mongoose.Document {
    code: string;
    type: string;
    expiry: Date
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const InspectionSchema = new mongoose.Schema(
    {
        producer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producer',
            required: true
        },
        asset: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Asset',
            required: true,
        },
        batch: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Batch',
            // required: true,
        },
        inspector: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Inspector',
            required: true,
        },
        type: {
            type: String,
            enum: [ "veterinary", "food-safety", "export-compliance", "lab-inspection", "quality-grading", "certification"],
            required: true
        },
        result: {
            type: String,
            enum: ['pass', 'fail', 'conditional'],
            required: true
        },
        remarks: {
            type: String
        },
        certification: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
  { timestamps: true }
);

applyPublicIdPlugin(InspectionSchema);

const Inspection = mongoose.model<InspectionDocument>("Inspection", InspectionSchema);

export default Inspection;