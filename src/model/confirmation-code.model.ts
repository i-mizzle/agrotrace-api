import mongoose from "mongoose";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";

export interface ConfirmationCodeDocument extends mongoose.Document {
    code: string;
    type: string;
    expiry: Date
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ConfirmationCodeSchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: true,
      immutable: true
    },
    valid: {
        type: Boolean,
        default: true
    },
    expiry: {
      type: Date,
      // required: true
    },
    type: { 
      type: String, 
      enum: ['password-reset', 'email-confirmation', 'admin-invitation'],
      default: 'email-confirmation',
      required: true 
    },
  },
  { timestamps: true }
);

const ConfirmationCode = mongoose.model<ConfirmationCodeDocument>("ConfirmationCode", ConfirmationCodeSchema);

export default ConfirmationCode;