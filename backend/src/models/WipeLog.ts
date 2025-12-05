/**
 * WipeLog Model
 * 
 * Defines the WipeLog schema for tracking device wipe operations.
 * Used for audit trail and analytics.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IWipeLog extends Document {
  certificateId: string;
  devicePath: string;
  deviceInfo: {
    serialNumber?: string;
    model?: string;
    size?: number;
  };
  operation: {
    method: string;
    passes: number;
    startTime: Date;
    endTime: Date;
    duration: number;
    status: 'success' | 'failed' | 'interrupted';
  };
  operator: {
    userId?: mongoose.Types.ObjectId;
    name: string;
    ipAddress?: string;
  };
  scriptInfo: {
    version: string;
    platform: 'windows' | 'linux';
    hostname?: string;
  };
  errors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WipeLogSchema: Schema = new Schema(
  {
    certificateId: {
      type: String,
      required: true,
      index: true,
    },
    devicePath: {
      type: String,
      required: true,
    },
    deviceInfo: {
      serialNumber: { type: String },
      model: { type: String },
      size: { type: Number },
    },
    operation: {
      method: { type: String, required: true },
      passes: { type: Number, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      duration: { type: Number, required: true },
      status: {
        type: String,
        enum: ['success', 'failed', 'interrupted'],
        required: true,
      },
    },
    operator: {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      ipAddress: { type: String },
    },
    scriptInfo: {
      version: { type: String, required: true },
      platform: {
        type: String,
        enum: ['windows', 'linux'],
        required: true,
      },
      hostname: { type: String },
    },
    errors: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
WipeLogSchema.index({ 'operation.status': 1 });
WipeLogSchema.index({ createdAt: -1 });
WipeLogSchema.index({ 'operator.userId': 1 });

export default mongoose.model<IWipeLog>('WipeLog', WipeLogSchema);
