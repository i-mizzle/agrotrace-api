import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";

const shipmentStatuses = ['draft', 'sealed', 'shipped', 'delivered']

export interface ShipmentDocument extends mongoose.Document {
    user: UserDocument['_id'];
    resetCode: ConfirmationCodeDocument['_id'];
    createdAt?: Date;
    updatedAt?: Date;
}

const ShipmentSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            unique: true,
            required: true
        },
        exporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exporter",
            required: true
        },
        destination: {
            country: {
                type: String,
                required: true
            },
            countryCode: {
                type: String,
                required: true
            },
            portOfExit: {
                type: String,
                required: true
            }
        },
        shipmentDate: {
            type: Date,
            required: true
        },
        estimatedArrivalDate: {
            type: Date
        },
        sealNumber: {
            type: String,
            // unique: true
        },
        status: {
            type: String,
            enum: shipmentStatuses,
            required: true
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: shipmentStatuses,
                    // required: true
                },
                date: {
                    type: Date
                }
            },
        ],
        documents: [
            {type: String}
        ],
        billOfLadenNumber: {
            type: String
        },
        customsDeclarationNumber: {
            type: String
        },

    },
  { timestamps: true }
);

const Shipment = mongoose.model<ShipmentDocument>("Shipment", ShipmentSchema);

export default Shipment;