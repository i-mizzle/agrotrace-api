import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";
import { InspectorDocument } from "./inspector.model";
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export interface InspectorUserDocument extends mongoose.Document {
    user: UserDocument['_id'];
    inspector: InspectorDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const InspectorUserSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    inspector: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Inspector" 
    }
  },
  { timestamps: true }
);

applyPublicIdPlugin(InspectorUserSchema);

const InspectorUser = mongoose.model<InspectorUserDocument>("InspectorUser", InspectorUserSchema);

export default InspectorUser;