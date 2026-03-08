import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";

export interface PasswordResetDocument extends mongoose.Document {
    user: UserDocument['_id'];
    resetCode: ConfirmationCodeDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const PasswordResetSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    resetCode: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ConfirmationCode" 
    }
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model<PasswordResetDocument>("PasswordReset", PasswordResetSchema);

export default PasswordReset;