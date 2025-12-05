/**
 * WipeLog Model
 * 
 * Defines the WipeLog schema for tracking device wipe operations.
 * Used for audit trail and raw log storage.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IWipeLog extends Document {
  wipeId: string;
  rawLog: string;
  devicePath: string;
  duration: number;
  exitCode: number;
  createdAt: Date;
  updatedAt: Date;
}

const WipeLogSchema: Schema = new Schema(
  {
    wipeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    rawLog: {
      type: String,
      required: true,
    },
    devicePath: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    exitCode: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WipeLogSchema.index({ wipeId: 1 });
WipeLogSchema.index({ createdAt: -1 });

export default mongoose.model<IWipeLog>('WipeLog', WipeLogSchema);
