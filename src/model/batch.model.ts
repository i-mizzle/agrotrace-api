import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

const batchStatuses = ['open', 'closed', 'exported']

export interface BatchDocument extends mongoose.Document {
    producer: mongoose.Schema.Types.ObjectId;
    batchCode: string;
    type: 'crop' | 'meat' | 'live-animal' | 'others';
    status: typeof batchStatuses[number];
    statusHistory: {
        status: typeof batchStatuses[number];
        date: Date;
        changedBy: UserDocument["_id"];
    }[];
    assetContributions: {
        asset: mongoose.Schema.Types.ObjectId;
        contribution:{
            quantity: number;
            unit: 'kg' | 'tons' | 'head' | 'cartons' | 'bags';
            date: Date;
        }
    }[];
    productContributions: {
        asset: mongoose.Schema.Types.ObjectId;
        contribution:{
            quantity: number;
            unit: 'kg' | 'tons' | 'head' | 'cartons' | 'bags';
            date: Date;
        }
    }[];
    quantity:{ 
        total: number;
        unit: 'kg' | 'tons' | 'head' | 'cartons' | 'bags';
    };
    aggregation: {
        aggregated: boolean;
        sources: {
            source: string;
            total: number;
            unit: 'kg' | 'tons' | 'head' | 'cartons' | 'bags';
        }[];
    };
    storageLocation?: mongoose.Schema.Types.ObjectId;
    expiryDate?: Date;
    qualityGrade?: string;
    deleted: Boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const BatchSchema = new mongoose.Schema(
    {
        producer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producer',
            required: true
        },
        batchCode: {
            type: String, //12-digit human readable
            required: true
        },
        type: {
            type: String,
            enum: ['crop', 'meat', 'live-animal', 'others'],
            required: true
        }, 
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: batchStatuses,
            required: true
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: batchStatuses
                },
                date: {
                    type: Date
                },
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'User',
                }
            }
        ],
        assetContributions: [
            {
                asset: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: "Asset",
                },
                contribution:{
                    quantity: {
                        type: Number,
                    },
                    unit: {
                        type: String,
                        enum: ['kg', 'tons', 'head', 'cartons', 'bags'],
                    },
                    date: {
                        type: Date,
                    }
                }
            }
        ],
        productContributions: [
            {
                asset: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: "Product",
                },
                contribution:{
                    quantity: {
                        type: Number,
                    },
                    unit: {
                        type: String,
                        enum: ['kg', 'tons', 'head', 'cartons', 'bags'],
                    },
                    date: {
                        type: Date,
                    }
                }
            }
        ],
        quantity:{ 
            total: {
                type: Number
            },
            unit: {
                type: String,
                enum: ['kg', 'tons', 'head', 'cartons', 'bags']
            }
        },
        aggregation: {
            aggregated: {
                type: Boolean,
                default: false
            },
            sources: [
                {
                    source: {
                        type: String
                    },
                    total: {
                        type: Number
                    },
                    unit: {
                        type: String,
                        enum: ['kg', 'tons', 'head', 'cartons', 'bags']
                    }
                },
            ],
        },
        storageLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location'
        },
        expiryDate: {
            type: Date
        },
        qualityGrade: {
            type: String
        }
    },
    { 
        timestamps: true, 
        collection: 'batches' 
    }
);

applyPublicIdPlugin(BatchSchema);

const Batch = mongoose.model<BatchDocument>('Batch', BatchSchema);

export default Batch;