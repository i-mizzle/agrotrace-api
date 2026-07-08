import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

export interface ProducerDocument extends mongoose.Document {
    name: string;
    type: string
    contact: {
        email: string
        phone: string
    }
    idType: string
    idNumber: string
    primaryLocation: {
        state: string
        lga: string
    }
    riskScore: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
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
        riskScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        riskLevel: {
            type: String,
            enum: ['low', 'moderate', 'high', 'critical'],
            default: 'low',
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

applyPublicIdPlugin(ProducerSchema);

const Producer = mongoose.model<ProducerDocument>('Producer', ProducerSchema);

export default Producer;