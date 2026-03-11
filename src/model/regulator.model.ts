import mongoose, { Schema, Document } from "mongoose"

export enum RegulatorType {
  GOVERNMENT = "government",
  CERTIFICATION_BODY = "certification_body",
  LABORATORY = "laboratory",
  INTERNATIONAL = "international"
}

export enum RegulatorStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended"
}

export interface RegulatorDocument extends Document {
  name: string
  acronym?: string

  type: RegulatorType

  contactEmail?: string
  contactPhone?: string
  website?: string

  headquartersAddress?: string
  state?: string
  country?: string

  regulatoryScope?: string[]

  status: RegulatorStatus

  createdAt: Date
  updatedAt: Date
}

const RegulatorSchema = new Schema<RegulatorDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    acronym: {
      type: String,
      uppercase: true
    },

    type: {
      type: String,
      enum: Object.values(RegulatorType),
      required: true
    },

    contactEmail: {
      type: String,
      lowercase: true
    },

    contactPhone: {
      type: String
    },

    website: {
      type: String
    },

    headquartersAddress: {
      type: String
    },

    state: {
      type: String
    },

    country: {
      type: String,
      default: "Nigeria"
    },

    regulatoryScope: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: Object.values(RegulatorStatus),
      default: RegulatorStatus.ACTIVE
    }
  },
  {
    timestamps: true
  }
)

export const Regulator = mongoose.model<RegulatorDocument>("Regulator",  RegulatorSchema )
