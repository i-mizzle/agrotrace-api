import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import { ConfirmationCodeDocument } from './confirmation-code.model';
import { RoleDocument } from './role.model';
import { ProducerDocument } from './producer.model';
import { ExporterDocument } from './exporter.model';
import { RegulatorDocument } from './regulator.model';
import { InspectorDocument } from './inspector.model';
import { generateUniquePublicId } from '../utils/public-id';
// import { ConfirmationCodeDocument } from './confirmation-code.model';
// import { AffiliateMarkupDocument } from './affiliate-markup.model';
// import { NairaWalletDocument } from './naira-wallet.model';
// import { RoleDocument } from './role.model';

export interface UserDocument extends mongoose.Document {
    id: string;
    email: string;
    // username: string;
    name: string;
    phone: string;
    organizationRoles?: {
        organization: ProducerDocument['_id'] | ExporterDocument['_id'] | RegulatorDocument['_id'] | InspectorDocument['_id']
        organizationModel?: 'Producer' | 'Exporter' | 'Regulator' | 'Inspector'
        roles: RoleDocument['_id'][]
    }
    avatar?: string;
    gender: 'female' | 'male'
    adminRoles?: RoleDocument["_id"][];
    idNumber?:string,
    permissions?: string[];
    password?: string;
    userType: string;
    confirmationCode?: ConfirmationCodeDocument["_id"];
    createdBy?: UserDocument["_id"];
    emailConfirmed: boolean
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>
}

const transformSerializedUser = (_doc: any, ret: any) => {
    ret.publicId = ret.id;
    delete ret._id;
    delete ret.__v;

    return ret;
};

const UserSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            index: true,
            immutable: true,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        confirmationCode: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConfirmationCode",
        },
        emailConfirmed: {
            type: Boolean,
            default: false,
        },
        userType: {
            type: String,
            enum: ['user', 'exporter', 'producer', 'inspector', 'regulator', 'admin', 'super-administrator'], // 
            default: 'user'
        },
        organizationRoles: {
            organization: {
                type: mongoose.Schema.Types.ObjectId, 
                refPath: 'organizationRoles.organizationModel'
            },
            organizationModel: {
                type: String,
                enum: ['Producer', 'Exporter', 'Regulator', 'Inspector']
            },
            roles: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Role'
            }]
        },
        adminRoles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }],
        idNumber: {
            type: String
        },
        name: {
            type: String,
            required: true
        },
        avatar: {
            type: String
        },
        gender: {
            type: String,
            enum: ['female', 'male']
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
        },
        
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        },
    },
    {
        timestamps: true,
        id: false,
        toJSON: {
            virtuals: true,
            transform: transformSerializedUser
        },
        toObject: {
            virtuals: true,
            transform: transformSerializedUser
        }
    },
);

UserSchema.pre('validate', async function (next: mongoose.HookNextFunction) {
    try {
        const user = this as UserDocument;

        if (!user.id) {
            user.id = await generateUniquePublicId(User, 'User');
        }

        return next();
    } catch (error: any) {
        return next(error);
    }
});

UserSchema.pre('save', async function (next: mongoose.HookNextFunction) {
    let user = this as UserDocument
    
    // return if a password is not provided for the user
    if(!user.password) {
        return
    }
    // Only hash the password if it's modified or new
    if(!user.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(parseInt(config.get('saltWorkFactor')));
    const hash = await bcrypt.hashSync(user.password, salt);
    
    user.password = hash
});

// Logging in
UserSchema.methods.comparePassword = async function(
    candidatePassword: string
) {
    const user = this as UserDocument;
    if (!user.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
}

const User = mongoose.model<UserDocument>('User', UserSchema)

export default User;