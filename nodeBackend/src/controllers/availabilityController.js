import availabilityModel from '../models/availability.js';
import asyncHandler from '../middleware/asyncHandler.js';
import {isTimeValid} from '../utils/time.js';

export const listAvailabilities = asyncHandler(async (req, res) => {
    const availabilities = (await availabilityModel.find({userId: req.user._id})).toSorted((a, b) => new Date(a.start) - new Date(b.start));
    res.json(availabilities);
});

export const saveAvailability = asyncHandler(async (req, res) => {
    const {dayOfWeek, slots} = req.body;
    if(dayOfWeek == undefined || dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({message: 'Invalid day of week'});
    }

    const cleanedSlots = (slots || []).filter((slot) => {
        return slot.startTime && slot.endTime && isTimeValid(slot.startTime, slot.endTime);
    });

    const availability = await availabilityModel.findOneAndUpdate(
        {userId: req.user._id, dayOfWeek},
        {slots: cleanedSlots},
        {returnDocument: 'after', upsert: true}
    );
    res.json(availability);
});