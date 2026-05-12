import mongoose from 'mongoose';

const coinTxSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['charge', 'purchase', 'refund'], required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

coinTxSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('CoinTransaction', coinTxSchema);
