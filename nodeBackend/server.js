import express from "express";
import connectDataBase from "./src/config/connectDB.js";
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import serviceRoutes from './src/routes/serviceRoutes.js'
import availabilityRoutes from './src/routes/availabilityRoutes.js'
import integrationRoutes from './src/routes/integrationRoutes.js'
import paymentRoutes from './src/routes/paymentRoutes.js'
import publicRoutes from './src/routes/publicRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

// Connect to database before starting server
await connectDataBase()

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/integration', integrationRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/public', publicRoutes)

app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Server error' });
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${port}`)
})

export default app