/**
 * Certificate Model
 * 
 * Defines the Certificate schema for device wipe certification.
 * Includes device information, wipe details, operator info, and digital signature.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string;
  deviceInfo: {
    serialNumber: string;
    model: string;
    capacity: string;
    type: 'USB' | 'HDD' | 'SSD' | 'OTHER';
  };
  wipeDetails: {
    method: string;
    passes: number;
    standard: string;
    duration: number;
    timestamp: Date;
  };
  operator: {
    name: string;
    organization?: string;
    email?: string;
  };
  signature: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema: Schema = new Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceInfo: {
      serialNumber: { type: String, required: true },
      model: { type: String, required: true },
      capacity: { type: String, required: true },
      type: {
        type: String,
        enum: ['USB', 'HDD', 'SSD', 'OTHER'],
        required: true,
      },
    },
    wipeDetails: {
      method: { type: String, required: true },
      passes: { type: Number, required: true, min: 1 },
      standard: { type: String, required: true },
      duration: { type: Number, required: true },
      timestamp: { type: Date, required: true },
    },
    operator: {
      name: { type: String, required: true },
      organization: { type: String },
      email: { type: String },
    },
    signature: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
CertificateSchema.index({ 'deviceInfo.serialNumber': 1 });
CertificateSchema.index({ createdAt: -1 });

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
