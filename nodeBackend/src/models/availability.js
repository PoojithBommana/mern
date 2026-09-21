import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
}, {id: false})


const availabilitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    slots: {
        type: [slotSchema],
        default: [],
    },

}, {timestamps: true})

availabilitySchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });

const availabilityModel = mongoose.model('Availability', availabilitySchema);

export default availabilityModel;