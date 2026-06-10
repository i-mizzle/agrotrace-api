import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";
import { RegulatorDocument } from "./regulator.model";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface RegulatorUserDocument extends mongoose.Document {
    user: UserDocument['_id'];
    regulator: RegulatorDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const RegulatorUserSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    regulator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Regulator" 
    }
  },
  { timestamps: true }
);

applyPublicIdPlugin(RegulatorUserSchema);

const RegulatorUser = mongoose.model<RegulatorUserDocument>("RegulatorUser", RegulatorUserSchema);

export default RegulatorUser;