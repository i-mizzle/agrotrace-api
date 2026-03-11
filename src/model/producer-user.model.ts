import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";
import { ProducerDocument } from "./producer.model";

export interface ProducerUserDocument extends mongoose.Document {
    user: UserDocument['_id'];
    producer: ProducerDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const ProducerUserSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    producer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Producer" 
    }
  },
  { timestamps: true }
);

const ProducerUser = mongoose.model<ProducerUserDocument>("ProducerUser", ProducerUserSchema);

export default ProducerUser;