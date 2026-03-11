import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";
import { ExporterDocument } from "./exporter.model";

export interface ExporterUserDocument extends mongoose.Document {
    user: UserDocument['_id'];
    exporter: ExporterDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const ExporterUserSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    exporter: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Exporter" 
    }
  },
  { timestamps: true }
);

const ExporterUser = mongoose.model<ExporterUserDocument>("ExporterUser", ExporterUserSchema);

export default ExporterUser;