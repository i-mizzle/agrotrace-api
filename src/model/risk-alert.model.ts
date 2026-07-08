import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { ProducerDocument } from './producer.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';

export type RiskAlertType =
  | 'inspection_fail'
  | 'inspection_conditional'
  | 'certification_expired'
  | 'certification_expiring'
  | 'batch_expired'
  | 'mortality_event'
  | 'asset_missing'
  | 'shipment_delayed';

export type RiskAlertStatus = 'open' | 'acknowledged' | 'resolved';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAlertDocument extends mongoose.Document {
  producer: ProducerDocument['_id'];
  alertType: RiskAlertType;
  severity: RiskSeverity;
  weight: number;
  message: string;
  status?: RiskAlertStatus;
  ref?: mongoose.Schema.Types.ObjectId;
  refModel?: string; // 'Inspection', 'Batch', 'Certification', 'Event', etc.
  acknowledgedBy?: UserDocument['_id'];
  acknowledgedAt?: Date;
  resolvedBy?: UserDocument['_id'];
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const RiskAlertSchema = new mongoose.Schema(
  {
    producer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producer',
      required: true,
      index: true,
    },
    alertType: {
      type: String,
      enum: [
        'inspection_fail',
        'inspection_conditional',
        'certification_expired',
        'certification_expiring',
        'batch_expired',
        'mortality_event',
        'asset_missing',
        'shipment_delayed',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'resolved'],
      default: 'open',
      index: true,
    },
    ref: {
      type: mongoose.Schema.Types.ObjectId,
    },
    refModel: {
      type: String,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

applyPublicIdPlugin(RiskAlertSchema);

const RiskAlert = mongoose.model<RiskAlertDocument>('RiskAlert', RiskAlertSchema);

export default RiskAlert;
