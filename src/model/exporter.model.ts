import mongoose, { Schema, Document } from "mongoose"

export enum ExporterStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  SUSPENDED = "suspended"
}

export enum ExportCommodity {
  SESAME = "sesame",
  COCOA = "cocoa",
  CASHEW = "cashew",
  MAIZE = "maize",
  SOYBEAN = "soybean",
  GINGER = "ginger",
  HIBISCUS = "hibiscus",
  SHEA_BUTTER = "shea_butter",
  LIVESTOCK = "livestock",
  POULTRY = "poultry"
}

export interface ExporterDocument extends Document {
  companyName: string
  registrationNumber?: string
  exportLicenseNumber?: string
  contact: {
    email: string
    phone: string
  }

  commodities: ExportCommodity[]

  address: {
    address: string
    state: string
    country: {
      country: string
      countryCode: string
    }
  }

  certifications?: string[]

  facilityLocations?: {
    name: string
    address: string
    state: string
    gps?: {
      lat: number
      lng: number
    }
  }[]

  status: ExporterStatus

  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ExporterSchema = new Schema<ExporterDocument>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },

    registrationNumber: {
      type: String
    },

    exportLicenseNumber: {
      type: String
    },

    contact: {
      email: {
        type: String,
        required: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true
      }
    },

    commodities: [
      {
        type: String,
        enum: Object.values(ExportCommodity)
      }
    ],

    address: {
      address: {
        type: String,
        required: true
      },
  
      state: {
        type: String,
        required: true
      },

      country: {
        country: {
          type: String,
          default: "Nigeria"
        },
      
        countryCode: {
          type: String,
          default: "NG"
        },
      }
      
    },

    certifications: [
      {
        type: String
      }
    ],

    facilityLocations: [
      {
        name: String,
        address: String,
        state: String,
        gps: {
          lat: Number,
          lng: Number
        }
      }
    ],

    status: {
      type: String,
      enum: Object.values(ExporterStatus),
      default: ExporterStatus.PENDING
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
)

export const Exporter = mongoose.model<ExporterDocument>("Exporter", ExporterSchema)