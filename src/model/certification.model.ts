import mongoose from "mongoose";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface CertificationDocument extends mongoose.Document {
    certificateNumber: string;
    file: string;
    expiry: Date
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const CertificationSchema = new mongoose.Schema(
  {
    certificateNumber: { 
      type: String, 
      required: true,
    },
    file: {
        type: String,
        default: true
    },
    expiry: {
      type: Date,
      // required: true
    },
  },
  { timestamps: true }
);

applyPublicIdPlugin(CertificationSchema);

const Certification = mongoose.model<CertificationDocument>("Certification", CertificationSchema);

export default Certification;