import mongoose from 'mongoose';
import { UserDocument } from './user.model';
// import { BusinessDocument } from './business.model';

export interface ProducerDocument extends mongoose.Document {
    name: string;
    slug: string;
    // bussiness: BusinessDocument["_id"]
    description: string;
    permissions: string[]
    deleted: Boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const ProducerSchema = new mongoose.Schema(
    {
        // business: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Business'
        // },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['farmer', 'rancher', 'cooperative', 'exporter', 'processor'],
            required: true
        },
        contact: {
            email: {
                type: String,
            },
            phone: {
                type: String
            }
        },
        idType: {
            type: String,
            enum: ['nin', 'bvn', 'cac', 'none'],
            required: true
        },
        idNumber: {
            type: String
        },
        primaryLocation: {
            state: {
                type: String,
            },
            lga: {
                type: String
            }
        }, 
        deleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        }
    },
    { timestamps: true }
);

const Producer = mongoose.model<ProducerDocument>('Producer', ProducerSchema);

export default Producer;