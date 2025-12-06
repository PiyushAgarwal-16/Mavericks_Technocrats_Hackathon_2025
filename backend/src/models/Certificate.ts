/**
 * Certificate Model
 * 
 * Defines the Certificate schema for device wipe certification.
 * Includes device information, wipe details, and digital signature.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  wipeId: string;
  userId: mongoose.Types.ObjectId | string;
  deviceModel: string;
  serialNumber?: string;
  method: string;
  timestamp: Date;
  logHash: string;
  signature: string;
  uploaded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema: Schema = new Schema(
  {
    wipeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.Mixed, // Allow both ObjectId and String for API key auth
      required: true,
      index: true,
    },
    deviceModel: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      sparse: true,
    },
    method: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    logHash: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    uploaded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
CertificateSchema.index({ wipeId: 1 });
CertificateSchema.index({ userId: 1 });
CertificateSchema.index({ createdAt: -1 });

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
