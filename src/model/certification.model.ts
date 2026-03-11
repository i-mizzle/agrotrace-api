import mongoose from "mongoose";

export interface CertificationDocument extends mongoose.Document {
    code: string;
    type: string;
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

const Certification = mongoose.model<CertificationDocument>("Certification", CertificationSchema);

export default Certification;