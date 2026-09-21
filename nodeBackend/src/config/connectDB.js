import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const connectDataBase = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
            bufferCommands: false, // Disable command buffering
        };

        await mongoose.connect(process.env.MONGO_URI, options);
        console.log("✅ DB is Connected");
    } catch (error) {
        console.error("❌ DB connection failed:", error.message);
        console.error("\n🔧 Troubleshooting:");
        console.error("1. Check if your IP is whitelisted in MongoDB Atlas");
        console.error("2. Verify your MongoDB credentials");
        console.error("3. Check your internet connection");
        console.error("4. Ensure MongoDB Atlas cluster is active\n");
        process.exit(1); // Exit the process if DB connection fails
    }
};

export default connectDataBase