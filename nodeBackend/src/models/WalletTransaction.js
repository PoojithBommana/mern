import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        index: true,
    },
    withdrawRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WithdrawRequest',
        index: true,
    },
    type:{
        type: String,
        enum: ['booking_payout', 'withdrawl_hold', 'withdrawl_reversal'],
        required: true,
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
        default: '',
        trim: true,
    },
}, { timestamps: true });



const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;