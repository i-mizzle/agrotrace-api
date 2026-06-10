import mongoose from "mongoose";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface InspectorDocument extends mongoose.Document {
    // -id: string
    createdBy: UserDocument["_id"]
    type:
        | "veterinary-inspector"
        | "food-safety-inspector"
        | "export-compliance-officer"
        | "lab-inspector"
        | "quality-grader"
        | "certification-agent"

    organizationName: string
    organizationType:
        | "government"
        | "private-lab"
        | "certification-body"
        | "export-authority"
        | "independent"

    licenseNumber?: string
    certificationBody?: string

    areasOfOperation: {
        state: string
        lga?: string
    }[]

    specialties?: string[]

    verification: {
        status: "pending" | "verified" | "rejected"
        verifiedBy?: string
        date?: Date
    }

    createdAt: Date
    updatedAt: Date
}

const InspectorSchema = new mongoose.Schema(
  {
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
        type: String,
        enum: ["veterinary-inspector", "food-safety-inspector", "export-compliance-officer", "lab-inspector", "quality-grader", "certification-agent"],
        required: true
    },
    organizationName: {
      type: String,
      required: true
    },
    organizationType: { 
      type: String, 
      enum: ["government", "private-lab", "certification-body", "export-authority", "independent"],
      required: true 
    },
    licenseNumber: {
      type: String
    },
    certificationBody: {
      type: String
    },
    areasOfOperation: [{
      state: {
        type: String
      },
      lga: {
        type: String
      }
    }],
    specialties: [{
      type: String
    }],
    verification: {
      status: {
        type: String,
        enum: [ "pending", "verified", "rejected"],
        default: "pending"
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date
      }
    }
  },
  { timestamps: true }
);

applyPublicIdPlugin(InspectorSchema);

const Inspector = mongoose.model<InspectorDocument>("Inspector", InspectorSchema);

export default Inspector;