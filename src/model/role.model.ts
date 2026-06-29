import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

export interface RoleDocument extends mongoose.Document {
    name: string;
    slug: string;
    description: string;
    permissions: string[]
    deleted: Boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const RoleSchema = new mongoose.Schema(
    {
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

applyPublicIdPlugin(RoleSchema);

const Role = mongoose.model<RoleDocument>('Role', RoleSchema);

export default Role;