import mongoose from 'mongoose';
import { UserDocument } from './user.model';
// import { BusinessDocument } from './business.model';

export interface RoleDocument extends mongoose.Document {
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

const RoleSchema = new mongoose.Schema(
    {
        // business: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Business'
        // },
        name: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            immutable: true
        },
        description: {
            type: String
        },
        permissions: [
            {
                type: String
            }
        ],
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

const Role = mongoose.model<RoleDocument>('Role', RoleSchema);

export default Role;