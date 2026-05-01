import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    utrNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
