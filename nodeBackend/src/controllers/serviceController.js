import serviceModel from '../models/service.js';
import asyncHandler from "../middleware/asyncHandler.js";


export const listServices = asyncHandler(async (req, res) => {
    const services = await serviceModel.find({ userId : req.user._id, isDeleted: { $ne: true } });
    res.status(200).json(services);
});

export const createService = asyncHandler(async (req, res) => {
    const { name, description, price, duration, icon } = req.body;
    if(!name || !duration) {
        return res.status(400).json({ message: 'Name, duration and icon are required' });
    }
    const service = await serviceModel.create({ userId : req.user._id, name, description, price, duration, icon });
    res.status(201).json(service);
});

export const updateService = asyncHandler(async (req, res) => {
      const updates = {};
      const allowedFields = ['name', 'duration', 'price', 'description', 'isActive', 'icon'];
  
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
  
      const service = await Service.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
        updates,
        { new: true }
      );
  
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
  
      res.json({ message: 'Service updated', service });
  });



  export const deleteService = asyncHandler(async (req, res) => {   
      const service = await serviceModel.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
        { isDeleted: true },
        { new: true }
      );
    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted', service });
});