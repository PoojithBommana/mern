import mongoose from 'mongoose';

const withdrawlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    payoutSnapshot: {
      accountHolderName: {
        type: String,
      },

      bankName: {
        type: String,
      },

      accountLast4: {
        type: String,
      },

      ifsc: {
        type: String,
      },

      upiId: {
        type: String,
      },
    },

    adminNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Withdrawl', withdrawlSchema);