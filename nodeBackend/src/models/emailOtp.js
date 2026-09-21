import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },

    purpose: {
        type: String,
        enum: ["registration", "booking"],
        required: true
    },

    codeHash: {
        type: String,
        required: true
    },

    attempts: {
        type: Number,
        default: 0
    },

    expireAt: {
        type: Date,
        required: true,
        index: {
            expires: 0
        }
    },

    consumeAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const emailOtpModel = mongoose.model("emailsOtp", emailSchema);

export default emailOtpModel;